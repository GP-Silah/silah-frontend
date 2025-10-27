import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import '../../Supplier/Settings/Settings.css';
import SignupBusinessActivity from '@/components/SingupBusinessActivity/SignupBusinessActivity';
import TapCardForm from '@/components/TapCardForm';

export default function BuyerSettings() {
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
  const isPasswordFormInvalid =
    !passwordForm.currentPassword ||
    !passwordForm.newPassword ||
    !passwordForm.confirmPassword ||
    Object.values(passwordErrors).some((error) => error);

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
    cvv: '',
  });

  const profileRef = useRef(null);

  useEffect(() => {
    document.title = t('pageTitle.settings', { ns: 'common' });
    document.documentElement.setAttribute('dir', i18n.dir());
  }, [i18n, i18n.language, t]);

  // Fetch initial data

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
        if (value !== passwordForm.newPassword) {
          error = t('errors.passwordMismatch');
        }
        break;
      default:
        break;
    }
    return error;
  };

  const handleCardSave = () => {
    if (card.number && card.number.length >= 4) {
      setHasSavedCard(true);
    }
  };

  const handleCardDelete = () => {
    setHasSavedCard(false);
    setCard({ name: '', number: '', expiry: '', cvv: '' });
  };

  const handlePasswordSubmit = async () => {
    setError('');
    const errors = {
      currentPassword: passwordForm.currentPassword ? '' : t('errors.required'),
      newPassword: validatePassword('newPassword', passwordForm.newPassword),
      confirmPassword: validatePassword(
        'confirmPassword',
        passwordForm.confirmPassword,
      ),
    };
    setPasswordErrors(errors);

    if (!Object.values(errors).some((error) => error)) {
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
        setPasswordErrors({
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
    if (file.size > 5 * 1024 * 1024) {
      setError(t('errors.fileTooLarge'));
      return;
    }
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      setError(t('errors.invalidFileType'));
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', file);

      const baseUrl = import.meta.env.VITE_BACKEND_URL || '';
      const endpoint = `${baseUrl}/api/users/me/profile-picture`;

      await axios.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true,
      });

      // Re-fetch updated info (this is key!)
      if (type === 'profile') {
        const { data } = await axios.get(`${baseUrl}/api/users/me`, {
          withCredentials: true,
        });

        setUser((prev) => ({
          ...prev,
          pfpFileName: data.pfpFileName,
          pfpUrl: data.pfpUrl,
          isDefaultPfp: data.pfpFileName?.includes('defaultavatars'),
        }));
      }

      setSuccess(t(`success.${type}Uploaded`));
    } catch (err) {
      setError(
        err.response?.data?.error?.message || t(`errors.${type}UploadFailed`),
      );
    }
  };

  const handleImageDelete = async (type) => {
    try {
      const baseUrl = import.meta.env.VITE_BACKEND_URL || '';
      if (type === 'profile' && store.pfpFileName) {
        await axios.delete(`${baseUrl}/api/users/me/profile-picture`, {
          withCredentials: true,
        });

        // ✅ Re-fetch to get the default avatar URL
        const { data } = await axios.get(`${baseUrl}/api/users/me`, {
          withCredentials: true,
        });

        setUser((prev) => ({
          ...prev,
          pfpFileName: data.pfpFileName,
          pfpUrl: data.pfpUrl,
          isDefaultPfp: data.pfpFileName?.includes('defaultavatars'),
        }));
      }

      setSuccess(t(`success.${type}Deleted`));
    } catch (err) {
      setError(
        err.response?.data?.error?.message || t(`errors.${type}DeleteFailed`),
      );
    }
  };

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(''), 2000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const handleSave = async () => {
    try {
      setError('');
      setSuccess('');

      const baseUrl = import.meta.env.VITE_BACKEND_URL || '';
      const userUpdates = {};
      if (user.name) userUpdates.name = user.name;
      if (biz.name) userUpdates.businessName = biz.name;
      if (biz.activity.length > 0) {
        userUpdates.categories = biz.activity
          .map((id) => Number(id))
          .filter((num) => !isNaN(num));
      }
      if (store.city) userUpdates.city = store.city;
      if (i18n.language) {
        userUpdates.preferredLanguage = i18n.language === 'ar' ? 'AR' : 'EN';
      }

      if (Object.keys(userUpdates).length > 0) {
        await axios.patch(`${baseUrl}/api/users/me`, userUpdates, {
          withCredentials: true,
        });
      }

      // Update notification preferences
      try {
        await axios.patch(
          `${baseUrl}/api/notifications/me/preferences`,
          {
            allowNotifications: notifications,
            ...notifTypes,
          },
          { withCredentials: true },
        );
      } catch (err) {
        console.error('Failed to update notifications:', err);
        setError(
          err.response?.data?.error?.message ||
            t('errors.notificationUpdateFailed'),
        );
      }

      setSuccess(t('success.settingsUpdated'));
    } catch (err) {
      setError(err.response?.data?.error?.message || t('errors.saveFailed'));
    }
  };

  if (hasSavedCard) {
    return (
      <div className="payment-section">
        <h3 className="payment-title">Payment Method</h3>
        <div className="saved-card">
          <div className="saved-card-info">
            <img src="/logo.svg" alt="Mada logo" className="mada-logo" />
            <span className="saved-card-number">
              **** {card.number.slice(-4)}
            </span>
          </div>
          <button className="remove-card" onClick={handleDelete}>
            ❌
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* المحتوى الرئيسي */}
      <div className="page-content" dir={i18n.dir()}>
        <div className="settings-container">
          <h2 className="settings-title">
            {t('pageTitle.settings', { ns: 'common' })}
          </h2>{' '}
          {/* التابات */}
          <div className="settings-tabs">
            {['general', 'account', 'notifications', 'payment', 'support'].map(
              (tab) => (
                <button
                  key={tab}
                  className={`settings-tab ${
                    activeTab === tab ? 'active' : ''
                  }`}
                  onClick={() => setActiveTab(tab)}
                >
                  {t(`tabs.${tab}`)}
                </button>
              ),
            )}
          </div>
          {/* General Tab */}
          {activeTab === 'general' && (
            <>
              <section className="settings-box">
                <h3>{t('userInfo.title')}</h3>
                <div className="grid-2">
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

              <section className="settings-box">
                <h3>{t('businessInfo.title')}</h3>
                <div className="grid-3">
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
                  <label className="full-width">
                    <span>{t('businessInfo.activity')}</span>
                    <SignupBusinessActivity
                      value={biz.activity}
                      onChange={(selectedValues) => {
                        if (selectedValues.length === 0) {
                          setError(t('errors.minOneCategory')); // show message
                          return; // stop deletion
                        }
                        setError('');
                        setBiz({ ...biz, activity: selectedValues });
                      }}
                    />
                  </label>
                </div>
              </section>
            </>
          )}
          {/* Account Tab */}
          {activeTab === 'account' && (
            <section className="settings-box">
              <h3>{t('account.title')}</h3>
              <div className="grid-2">
                <label>
                  <span>{t('account.email')}</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('placeholders.email')}
                  />
                </label>
                <label>
                  <span>{t('account.password')}</span>
                  <input type="password" value={password} readOnly />
                </label>
              </div>
              {showPasswordFields ? (
                <>
                  <div className="grid-2 mt-16">
                    <label className="full-width">
                      <span>{t('account.currentPassword')}</span>
                      <input
                        type="password"
                        value={passwordForm.currentPassword}
                        onChange={(e) => {
                          const value = e.target.value;
                          setPasswordForm({
                            ...passwordForm,
                            currentPassword: value,
                          });
                          setPasswordErrors({
                            ...passwordErrors,
                            currentPassword: value ? '' : t('errors.required'),
                          });
                        }}
                        placeholder={t('placeholders.currentPassword')}
                      />
                      {passwordErrors.currentPassword && (
                        <p className="error-text">
                          {passwordErrors.currentPassword}
                        </p>
                      )}
                    </label>
                  </div>
                  <div className="grid-2 mt-16">
                    <label>
                      <span>{t('account.newPassword')}</span>
                      <input
                        type="password"
                        value={passwordForm.newPassword}
                        onChange={(e) => {
                          const value = e.target.value;
                          setPasswordForm({
                            ...passwordForm,
                            newPassword: value,
                          });
                          setPasswordErrors({
                            ...passwordErrors,
                            newPassword: validatePassword('newPassword', value),
                            confirmPassword:
                              passwordForm.confirmPassword &&
                              validatePassword(
                                'confirmPassword',
                                passwordForm.confirmPassword,
                              ),
                          });
                        }}
                        placeholder={t('placeholders.newPassword')}
                      />
                      {passwordErrors.newPassword && (
                        <p className="error-text">
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
                          const value = e.target.value;
                          setPasswordForm({
                            ...passwordForm,
                            confirmPassword: value,
                          });
                          setPasswordErrors({
                            ...passwordErrors,
                            confirmPassword: validatePassword(
                              'confirmPassword',
                              value,
                            ),
                          });
                        }}
                        placeholder={t('placeholders.confirmPassword')}
                      />
                      {passwordErrors.confirmPassword && (
                        <p className="error-text">
                          {passwordErrors.confirmPassword}
                        </p>
                      )}
                    </label>
                  </div>
                  <button
                    type="button"
                    className={`btn-primary mt-24 ${
                      isPasswordFormInvalid ? 'btn-disabled' : ''
                    }`}
                    onClick={handlePasswordSubmit}
                    disabled={isPasswordFormInvalid}
                  >
                    {t('account.done')}
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  className="btn-primary mt-12"
                  onClick={() => setShowPasswordFields(true)}
                >
                  {t('account.changePassword')}
                </button>
              )}

              <div className="upload-section mt-24">
                {/* Profile Picture */}
                <div
                  className="upload-card"
                  onClick={() => profileRef.current.click()}
                >
                  {user.pfpFileName ? (
                    <div className="image-wrapper">
                      <img
                        src={user.pfpUrl}
                        alt="profile"
                        onError={(e) => (e.target.style.display = 'none')} // hide if URL fails
                      />

                      {/* show delete button only if NOT default */}
                      {!store.isDefaultPfp && (
                        <div className="delete-image-icon-bg">
                          <button
                            type="button"
                            className="pd-btn-image-delete"
                            aria-label={t('images.remove')}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleImageDelete('profile');
                            }}
                          >
                            ×
                          </button>
                        </div>
                      )}

                      {/* Allow uploading even when it's default */}
                      {user.isDefaultPfp && (
                        <div className="overlay-upload-hint">
                          <span className="upload-icon">⬆️</span>
                          <p>{t('account.upload')}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <>
                      <span className="upload-icon">⬆️</span>
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
          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <section className="settings-box">
              <h3>{t('notifications.title')}</h3>
              <div className="row-start gap-12 mt-12">
                <span>{t('notifications.allow')}</span>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={notifications}
                    onChange={(e) => setNotifications(e.target.checked)}
                  />
                  <span className="slider"></span>
                </label>
              </div>

              <div className="checkboxes mt-16">
                <p className="notif-description">{t('notifications.select')}</p>
                <div className="grid-2">
                  {Object.keys(notifTypes).map((key) => (
                    <label key={key} className="check">
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
          {/* Payment Tab */}
          {activeTab === 'payment' && (
            <section className="settings-box">
              <div className="payment-section">
                <h3 className="payment-title">Payment Method</h3>
                <p className="payment-hint">
                  You don't have a saved card yet. Add one to make your payments
                  easier. <br />
                  Add your card below
                </p>

                {/* <TapCardForm isActive={activeTab === 'payment'} /> */}
                <TapCardForm isActive={true} />

                {/* <div className="payment-grid">
        <label>
          <span>Cardholder Name</span>
          <input
            value={card.name}
            onChange={(e) => setCard({ ...card, name: e.target.value })}
            placeholder="Cardholder Name"
          />
        </label>
        <label>
          <span>Card Number</span>
          <input
            value={card.number}
            onChange={(e) => setCard({ ...card, number: e.target.value })}
            placeholder="Card Number"
          />
        </label>
        <label>
          <span>MM/YY</span>
          <input
            value={card.expiry}
            onChange={(e) => setCard({ ...card, expiry: e.target.value })}
            placeholder="MM/YY"
          />
        </label>
        <label>
          <span>CVV</span>
          <input
            value={card.cvv}
            onChange={(e) => setCard({ ...card, cvv: e.target.value })}
            placeholder="CVV"
          />
        </label>
      </div> */}

                <button
                  type="button"
                  className="payment-button"
                  onClick={handleCardSave}
                >
                  {t('payment.save')}
                </button>
              </div>
            </section>
          )}
          {/* Support Tab */}
          {activeTab === 'support' && (
            <section className="settings-box support-section">
              <h3 className="support-title">{t('support.helpTitle')}</h3>
              <p className="support-text">
                {t('support.paragraph1')}
                <br />
                {t('support.paragraph2')}
              </p>
              <p className="support-email">
                <strong>{t('support.emailLabel')}</strong>{' '}
                <a href="mailto:support@silah.site">{t('support.email')}</a>
              </p>
              <p className="support-text">{t('support.paragraph3')}</p>
            </section>
          )}
          <button
            type="button"
            className={`btn-primary mt-24 ${error ? 'btn-disabled' : ''}`}
            onClick={handleSave}
            disabled={loading || !!error}
          >
            {t('actions.save')}
          </button>
        </div>
      </div>
    </div>
  );
}
