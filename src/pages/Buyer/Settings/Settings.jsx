import React, { useState, useRef, useEffect, memo } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import styles from '../../Supplier/Settings/Settings.module.css';
import SignupBusinessActivity from '@/components/SingupBusinessActivity/SignupBusinessActivity';
import TapCardForm from '@/components/Tap/TapCardForm';

const BuyerSettings = () => {
  const { t, i18n } = useTranslation('settings');
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [user, setUser] = useState({
    name: '',
    nid: '',
    pfpFileName: '',
    pfpUrl: '',
    isDefaultPfp: true,
    tapCustomerId: '',
  });
  const [biz, setBiz] = useState({ name: '', crn: '', activity: [] });
  const [email, setEmail] = useState('');
  const [password] = useState('********');
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordErrors, setPasswordErrors] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [notifications, setNotifications] = useState(true);
  const [notifTypes, setNotifTypes] = useState({
    newMessageNotify: true,
    newInvoiceNotify: true,
    newOfferNotify: true,
    orderStatusNotify: true,
    groupPurchaseStatusNotify: true,
  });
  const [hasSavedCard, setHasSavedCard] = useState(false);
  const [card, setCard] = useState({
    name: '',
    number: '',
    expiry: '',
  });
  const profileRef = useRef(null);

  const isPasswordFormInvalid =
    !passwordForm.currentPassword ||
    !passwordForm.newPassword ||
    !passwordForm.confirmPassword ||
    Object.values(passwordErrors).some((error) => error);

  useEffect(() => {
    document.title = t('pageTitle.settings', { ns: 'common' });
    document.documentElement.setAttribute('dir', i18n.dir());
  }, [i18n, i18n.language, t]);

  useEffect(() => {
    const fetchData = async () => {
      const controller = new AbortController();
      setLoading(true);
      try {
        const userRequest = axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/users/me`,
          { withCredentials: true, signal: controller.signal },
        );
        const cardRequest = axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/buyers/me/card`,
          { withCredentials: true, signal: controller.signal },
        );
        const notifRequest = axios.get(
          `${
            import.meta.env.VITE_BACKEND_URL
          }/api/notifications/me/preferences`,
          { withCredentials: true, signal: controller.signal },
        );

        const [userResponse, cardResponse, notifResponse] =
          await Promise.allSettled([userRequest, cardRequest, notifRequest]);

        if (userResponse.status === 'fulfilled') {
          const userData = userResponse.value.data;
          setUser({
            name: userData.name || '',
            nid: userData.nid || '',
            pfpFileName: userData.pfpFileName || '',
            pfpUrl: userData.pfpUrl || '',
            isDefaultPfp:
              userData.pfpFileName?.includes('defaultavatars') || false,
            tapCustomerId: userData.tapCustomerId || '',
          });
          setEmail(userData.email || '');
          setBiz({
            name: userData.businessName || '',
            crn: userData.crn || '',
            activity: userData.categories?.map((cat) => cat.id) || [],
          });
          if (userData.preferredLanguage) {
            const lang = userData.preferredLanguage === 'ARA' ? 'ar' : 'en';
            if (i18n.language !== lang) i18n.changeLanguage(lang);
          }
        }

        if (
          cardResponse.status === 'fulfilled' &&
          cardResponse.value.data.message !== 'No card found'
        ) {
          const c = cardResponse.value.data;
          setHasSavedCard(true);
          setCard({
            name: c.cardHolderName || '',
            number: `**** ${c.last4 || ''}`,
            expiry: `${c.expMonth}/${c.expYear}`,
          });
        } else {
          setHasSavedCard(false);
        }

        if (notifResponse.status === 'fulfilled') {
          const prefs = notifResponse.value.data.notificationPreferences || {};
          setNotifications(prefs.allowNotifications ?? true);
          setNotifTypes({
            newMessageNotify: prefs.newMessageNotify ?? true,
            newInvoiceNotify: prefs.newInvoiceNotify ?? true,
            newOfferNotify: prefs.newOfferNotify ?? true,
            orderStatusNotify: prefs.orderStatusNotify ?? true,
            groupPurchaseStatusNotify: prefs.groupPurchaseStatusNotify ?? true,
          });
        }
      } catch (err) {
        if (!axios.isCancel(err)) {
          setError(
            err.response?.data?.error?.message || t('errors.fetchFailed'),
          );
        }
      } finally {
        setLoading(false);
      }
      return () => controller.abort();
    };
    fetchData();
  }, [i18n.language, t]);

  const validatePassword = (field, value) => {
    let error = '';
    switch (field) {
      case 'newPassword':
        if (
          value &&
          !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@#!$]{8,28}$/.test(value)
        ) {
          error = t('errors.weakPassword');
        }
        break;
      case 'confirmPassword':
        if (value !== passwordForm.newPassword)
          error = t('errors.passwordMismatch');
        break;
      default:
        break;
    }
    return error;
  };

  const handleTokenGenerated = async (tokenId) => {
    setLoading(true);
    try {
      const { data } = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/buyers/me/card`,
        {
          tokenId,
          redirectUrl:
            window.location.origin + '/buyer/payment/callback?type=card',
        },
        { withCredentials: true },
      );
      window.location.href = data.transactionUrl;
    } catch (err) {
      setError(
        err.response?.data?.error?.message || t('errors.saveCardFailed'),
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCardDelete = async () => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/api/buyers/me/card`,
        { withCredentials: true },
      );
      setHasSavedCard(false);
      setCard({ name: '', number: '', expiry: '' });
      setSuccess(t('success.cardDeleted'));
    } catch (err) {
      setError(
        err.response?.data?.error?.message || t('errors.cardDeleteFailed'),
      );
    }
  };

  const handlePasswordSubmit = async () => {
    const errors = {
      currentPassword: passwordForm.currentPassword ? '' : t('errors.required'),
      newPassword: validatePassword('newPassword', passwordForm.newPassword),
      confirmPassword: validatePassword(
        'confirmPassword',
        passwordForm.confirmPassword,
      ),
    };
    setPasswordErrors(errors);
    if (Object.values(errors).every((e) => !e)) {
      try {
        await axios.patch(
          `${import.meta.env.VITE_BACKEND_URL}/api/auth/me/change-password`,
          {
            oldPassword: passwordForm.currentPassword,
            newPassword: passwordForm.newPassword,
          },
          { withCredentials: true },
        );
        setSuccess(t('success.passwordUpdated'));
        setShowPasswordFields(false);
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      } catch (err) {
        setError(
          err.response?.data?.error?.message ||
            t('errors.passwordUpdateFailed'),
        );
      }
    }
  };

  const handleImageUpload = async (file, type) => {
    if (!file) return;
    if (
      file.size > 5 * 1024 * 1024 ||
      !['image/png', 'image/jpeg', 'image/webp'].includes(file.type)
    ) {
      setError(t('errors.fileTooLarge') || t('errors.invalidFileType'));
      return;
    }
    const formData = new FormData();
    formData.append('file', file);
    try {
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/users/me/profile-picture`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          withCredentials: true,
        },
      );
      const { data } = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/users/me`,
        { withCredentials: true },
      );
      setUser((prev) => ({
        ...prev,
        pfpFileName: data.pfpFileName,
        pfpUrl: data.pfpUrl,
        isDefaultPfp: data.pfpFileName?.includes('defaultavatars'),
      }));
      setSuccess(t('success.profileUploaded'));
    } catch (err) {
      setError(
        err.response?.data?.error?.message || t('errors.profileUploadFailed'),
      );
    }
  };

  const handleImageDelete = async () => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/api/users/me/profile-picture`,
        { withCredentials: true },
      );
      const { data } = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/users/me`,
        { withCredentials: true },
      );
      setUser((prev) => ({
        ...prev,
        pfpFileName: data.pfpFileName,
        pfpUrl: data.pfpUrl,
        isDefaultPfp: true,
      }));
      setSuccess(t('success.profileDeleted'));
    } catch (err) {
      setError(
        err.response?.data?.error?.message || t('errors.profileDeleteFailed'),
      );
    }
  };

  const handleSave = async () => {
    try {
      setError('');
      setSuccess('');
      const updates = {};
      if (user.name) updates.name = user.name;
      if (biz.name) updates.businessName = biz.name;
      if (biz.activity.length > 0)
        updates.categories = biz.activity.map(Number);
      if (email) updates.email = email;
      if (i18n.language)
        updates.preferredLanguage = i18n.language === 'ar' ? 'ARA' : 'ENG';

      if (Object.keys(updates).length > 0) {
        await axios.patch(
          `${import.meta.env.VITE_BACKEND_URL}/api/users/me`,
          updates,
          { withCredentials: true },
        );
      }
      await axios.patch(
        `${import.meta.env.VITE_BACKEND_URL}/api/notifications/me/preferences`,
        { allowNotifications: notifications, ...notifTypes },
        { withCredentials: true },
      );
      setSuccess(t('success.settingsUpdated'));
    } catch (err) {
      setError(err.response?.data?.error?.message || t('errors.saveFailed'));
    }
  };

  useEffect(() => {
    if (success) {
      const t = setTimeout(() => setSuccess(''), 2000);
      return () => clearTimeout(t);
    }
  }, [success]);

  return (
    <div className={styles['dashboard-container']}>
      <div className={styles['page-content']} dir={i18n.dir()}>
        <div className={styles['settings-container']}>
          {loading && <p>{t('loading')}</p>}
          {error && <p className={styles['error-text']}>{error}</p>}
          {success && <p className={styles['success-text']}>{success}</p>}

          <h2 className={styles['settings-title']}>
            {t('pageTitle.settings', { ns: 'common' })}
          </h2>

          <div className={styles['settings-tabs']}>
            {['general', 'account', 'notifications', 'payment', 'support'].map(
              (tab) => (
                <button
                  key={tab}
                  className={`${styles['settings-tab']} ${
                    activeTab === tab ? styles.active : ''
                  }`}
                  onClick={() => setActiveTab(tab)}
                >
                  {t(`tabs.${tab}`)}
                </button>
              ),
            )}
          </div>

          {activeTab === 'general' && (
            <>
              <section className={styles['settings-box']}>
                <h3>{t('userInfo.title')}</h3>
                <div className={styles['grid-2']}>
                  <label>
                    <span>{t('userInfo.name')}</span>
                    <input
                      value={user.name}
                      onChange={(e) =>
                        setUser({ ...user, name: e.target.value })
                      }
                      placeholder={t('placeholders.name')}
                    />
                  </label>
                  <label>
                    <span>{t('userInfo.nid')}</span>
                    <input value={user.nid} readOnly />
                  </label>
                </div>
              </section>

              <section className={styles['settings-box']}>
                <h3>{t('businessInfo.title')}</h3>
                <div className={styles['grid-3']}>
                  <label>
                    <span>{t('businessInfo.businessName')}</span>
                    <input
                      value={biz.name}
                      onChange={(e) => setBiz({ ...biz, name: e.target.value })}
                      placeholder={t('placeholders.businessName')}
                    />
                  </label>
                  <label>
                    <span>{t('businessInfo.crn')}</span>
                    <input value={biz.crn} readOnly />
                  </label>
                  <label className={styles['full-width']}>
                    <span>{t('businessInfo.activity')}</span>
                    <SignupBusinessActivity
                      value={biz.activity}
                      onChange={(selected) => {
                        if (selected.length === 0 && biz.activity.length > 0) {
                          setError(t('errors.minOneCategory'));
                          return;
                        }
                        setError('');
                        setBiz({ ...biz, activity: selected });
                      }}
                    />
                  </label>
                </div>
              </section>
            </>
          )}

          {activeTab === 'account' && (
            <section className={styles['settings-box']}>
              <h3>{t('account.title')}</h3>
              <div className={styles['grid-2']}>
                <label>
                  <span>{t('account.email')}</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </label>
                <label>
                  <span>{t('account.password')}</span>
                  <input type="password" value={password} readOnly />
                </label>
              </div>

              {showPasswordFields ? (
                <>
                  <div className={`${styles['grid-2']} ${styles['mt-16']}`}>
                    <label className={styles['full-width']}>
                      <span>{t('account.currentPassword')}</span>
                      <input
                        type="password"
                        value={passwordForm.currentPassword}
                        onChange={(e) => {
                          const v = e.target.value;
                          setPasswordForm({
                            ...passwordForm,
                            currentPassword: v,
                          });
                          setPasswordErrors({
                            ...passwordErrors,
                            currentPassword: v ? '' : t('errors.required'),
                          });
                        }}
                      />
                      {passwordErrors.currentPassword && (
                        <p className={styles['error-text']}>
                          {passwordErrors.currentPassword}
                        </p>
                      )}
                    </label>
                  </div>

                  <div className={`${styles['grid-2']} ${styles['mt-16']}`}>
                    <label>
                      <span>{t('account.newPassword')}</span>
                      <input
                        type="password"
                        value={passwordForm.newPassword}
                        onChange={(e) => {
                          const v = e.target.value;
                          setPasswordForm({ ...passwordForm, newPassword: v });
                          setPasswordErrors({
                            ...passwordErrors,
                            newPassword: validatePassword('newPassword', v),
                            confirmPassword:
                              passwordForm.confirmPassword &&
                              validatePassword(
                                'confirmPassword',
                                passwordForm.confirmPassword,
                              ),
                          });
                        }}
                      />
                      {passwordErrors.newPassword && (
                        <p className={styles['error-text']}>
                          {passwordErrors.newPassword}
                        </p>
                      )}
                    </label>
                    <label>
                      <span>{t('account.confirmPassword')}</span>
                      <input
                        type="password"
                        value={passwordForm.confirmPassword}
                        onChange={(e) => {
                          const v = e.target.value;
                          setPasswordForm({
                            ...passwordForm,
                            confirmPassword: v,
                          });
                          setPasswordErrors({
                            ...passwordErrors,
                            confirmPassword: validatePassword(
                              'confirmPassword',
                              v,
                            ),
                          });
                        }}
                      />
                      {passwordErrors.confirmPassword && (
                        <p className={styles['error-text']}>
                          {passwordErrors.confirmPassword}
                        </p>
                      )}
                    </label>
                  </div>

                  <button
                    className={`${styles['btn-primary']} ${styles['mt-24']} ${
                      isPasswordFormInvalid ? styles['btn-disabled'] : ''
                    }`}
                    onClick={handlePasswordSubmit}
                    disabled={isPasswordFormInvalid}
                  >
                    {t('account.done')}
                  </button>
                </>
              ) : (
                <button
                  className={`${styles['btn-primary']} ${styles['mt-12']}`}
                  onClick={() => setShowPasswordFields(true)}
                >
                  {t('account.changePassword')}
                </button>
              )}

              <div className={`${styles['upload-section']} ${styles['mt-24']}`}>
                <div
                  className={styles['upload-card']}
                  onClick={() => profileRef.current?.click()}
                >
                  {user.pfpFileName ? (
                    <div className={styles['image-wrapper']}>
                      <img
                        src={user.pfpUrl}
                        alt="profile"
                        onError={(e) => (e.target.style.display = 'none')}
                      />
                      {!user.isDefaultPfp && (
                        <div className={styles['delete-image-icon-bg']}>
                          <button
                            type="button"
                            className={styles['pd-btn-image-delete']}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleImageDelete();
                            }}
                          >
                            ×
                          </button>
                        </div>
                      )}
                      {user.isDefaultPfp && (
                        <div className={styles['overlay-upload-hint']}>
                          <span className={styles['upload-icon']}>⬆️</span>
                          <p>{t('account.upload')}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <>
                      <span className={styles['upload-icon']}>⬆️</span>
                      <p>{t('account.upload')}</p>
                    </>
                  )}
                  <input
                    ref={profileRef}
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={(e) =>
                      handleImageUpload(e.target.files[0], 'profile')
                    }
                  />
                </div>
              </div>
            </section>
          )}

          {activeTab === 'notifications' && (
            <section className={styles['settings-box']}>
              <h3>{t('notifications.title')}</h3>
              <div
                className={`${styles['row-start']} ${styles['gap-12']} ${styles['mt-12']}`}
              >
                <span>{t('notifications.allow')}</span>
                <label className={styles.switch}>
                  <input
                    type="checkbox"
                    checked={notifications}
                    onChange={(e) => setNotifications(e.target.checked)}
                  />
                  <span className={styles.slider}></span>
                </label>
              </div>
              <div className={`${styles.checkboxes} ${styles['mt-16']}`}>
                <p className={styles['notif-description']}>
                  {t('notifications.select')}
                </p>
                <div className={styles['grid-2']}>
                  {Object.keys(notifTypes).map((key) => (
                    <label key={key} className={styles.check}>
                      <input
                        type="checkbox"
                        checked={notifTypes[key]}
                        disabled={!notifications}
                        onChange={(e) =>
                          setNotifTypes({
                            ...notifTypes,
                            [key]: e.target.checked,
                          })
                        }
                      />
                      <span>{t(`notifications.${key}`)}</span>
                    </label>
                  ))}
                </div>
              </div>
            </section>
          )}

          {activeTab === 'payment' && (
            <section className={styles['settings-box']}>
              <div className={styles['payment-section']}>
                <h3 className={styles['payment-title']}>
                  {t('payment.title')}
                </h3>
                {hasSavedCard ? (
                  <div className={styles['saved-card']}>
                    <div className={styles['saved-card-info']}>
                      <img
                        src="/mada-logo.svg"
                        alt="Mada"
                        className={styles['mada-logo']}
                      />
                      <div className={styles['saved-card-details']}>
                        <span className={styles['saved-card-number']}>
                          {card.number}
                        </span>
                        <div className={styles['saved-card-row']}>
                          <span className={styles['saved-card-name']}>
                            {card.name}
                          </span>
                          <span className={styles['saved-card-expiry']}>
                            {card.expiry}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className={styles['delete-image-icon-bg']}>
                      <button
                        type="button"
                        className={styles['pd-btn-image-delete']}
                        onClick={handleCardDelete}
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className={styles['payment-hint']}>
                      {t('payment.hint')}
                    </p>
                    <div className={styles['tap-card-wrapper']}>
                      <TapCardForm
                        isActive={activeTab === 'payment'}
                        onTokenGenerated={handleTokenGenerated}
                        onError={(msg) => setError(msg)}
                        customerId={user.tapCustomerId}
                        t={t}
                      />
                    </div>
                  </>
                )}
              </div>
            </section>
          )}

          {activeTab === 'support' && (
            <section
              className={`${styles['settings-box']} ${styles['support-section']}`}
            >
              <h3 className={styles['support-title']}>
                {t('support.helpTitle')}
              </h3>
              <p className={styles['support-text']}>
                {t('support.paragraph1')}
                <br />
                {t('support.paragraph2')}
              </p>
              <p className={styles['support-email']}>
                <strong>{t('support.emailLabel')}</strong>{' '}
                <a href="mailto:support@silah.site">{t('support.email')}</a>
              </p>
              <p className={styles['support-text']}>
                {t('support.paragraph3')}
              </p>
            </section>
          )}

          <button
            type="button"
            className={`${styles['btn-primary']} ${styles['mt-24']} ${
              error ? styles['btn-disabled'] : ''
            }`}
            onClick={handleSave}
            disabled={loading || !!error}
          >
            {t('actions.save')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default memo(BuyerSettings);
