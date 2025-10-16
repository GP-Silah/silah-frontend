import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Sidebar from '../../components/Sidebar/Sidebar';
import './Settings.css';

export default function Settings() {
  const { t, i18n } = useTranslation('settings');

  const [user, setUser] = useState({ name: '', nid: '' });
  const [biz, setBiz] = useState({ name: '', crn: '', activity: '' });
  const [email, setEmail] = useState('');
  const [password] = useState('********');
  const [notifications, setNotifications] = useState(true);
  const [notifTypes, setNotifTypes] = useState({
    messages: true,
    orders: true,
    reviews: true,
    biddings: true,
    invoices: true,
  });
  const [store, setStore] = useState({
    closed: false,
    closeMsg: '',
    city: '',
    fees: '',
    bio: '',
  });

  const profileRef = useRef(null);
  const bannerRef = useRef(null);

  useEffect(() => {
    document.title = t('pageTitle.settings', { ns: 'common' });
    document.documentElement.setAttribute('dir', i18n.dir());
  }, [i18n, i18n.language, t]);

  return (
    <div className="dashboard-container">
      {/*السايدبار على اليسار */}
      <Sidebar />
      {/* محتوى الإعدادات */}
      <div className="page-content">
        <div className="settings-container">
          <h2 className="settings-title">{t('pageTitle')}</h2>

          {/* User Info */}
          <section className="settings-box">
            <h3>{t('userInfo.title')}</h3>
            <div className="grid-2">
              <label>
                <span>{t('userInfo.name')}</span>
                <input
                  value={user.name}
                  onChange={(e) => setUser({ ...user, name: e.target.value })}
                  placeholder={t('placeholders.name')}
                />
              </label>
              <label>
                <span>{t('userInfo.nid')}</span>
                <input
                  value={user.nid}
                  onChange={(e) => setUser({ ...user, nid: e.target.value })}
                  placeholder={t('placeholders.nid')}
                />
              </label>
            </div>
          </section>

          {/* Business Info */}
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
                <input
                  value={biz.crn}
                  onChange={(e) => setBiz({ ...biz, crn: e.target.value })}
                  placeholder={t('placeholders.crn')}
                />
              </label>
              <label>
                <span>{t('businessInfo.activity')}</span>
                <input
                  value={biz.activity}
                  onChange={(e) => setBiz({ ...biz, activity: e.target.value })}
                  placeholder={t('placeholders.activity')}
                />
              </label>
            </div>
          </section>

          {/* Account Info */}
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
            <button
              type="button"
              className="btn-primary mt-12"
              onClick={() => alert(t('actions.demo'))}
            >
              {t('account.changePassword')}
            </button>
          </section>

          {/* Subscription */}
          <section className="settings-box">
            <h3>{t('subscription.title')}</h3>
            <div className="row-between">
              <span>
                {t('subscription.current')} <strong>{t('plans.basic')}</strong>
              </span>
              <button
                type="button"
                className="btn-primary"
                onClick={() => alert(t('actions.demo'))}
              >
                {t('subscription.manage')}
              </button>
            </div>
          </section>

          {/* Notifications Section */}
          <section className="settings-box">
            <h3>{t('notifications.title')}</h3>

            {/* Allow Notifications Toggle */}
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

            {/* Notification Type Checkboxes */}
            <div className="checkboxes mt-16">
              <p
                style={{
                  fontSize: '14px',
                  color: '#555',
                  marginBottom: '10px',
                }}
              >
                {t('notifications.select')}
              </p>
              <div className="grid-2">
                <label className="check">
                  <input
                    type="checkbox"
                    checked={notifTypes.messages}
                    disabled={!notifications}
                    onChange={(e) =>
                      setNotifTypes({
                        ...notifTypes,
                        messages: e.target.checked,
                      })
                    }
                  />
                  <span>{t('notifications.messages')}</span>
                </label>

                <label className="check">
                  <input
                    type="checkbox"
                    checked={notifTypes.orders}
                    disabled={!notifications}
                    onChange={(e) =>
                      setNotifTypes({ ...notifTypes, orders: e.target.checked })
                    }
                  />
                  <span>{t('notifications.orders')}</span>
                </label>

                <label className="check">
                  <input
                    type="checkbox"
                    checked={notifTypes.reviews}
                    disabled={!notifications}
                    onChange={(e) =>
                      setNotifTypes({
                        ...notifTypes,
                        reviews: e.target.checked,
                      })
                    }
                  />
                  <span>{t('notifications.reviews')}</span>
                </label>

                <label className="check">
                  <input
                    type="checkbox"
                    checked={notifTypes.biddings}
                    disabled={!notifications}
                    onChange={(e) =>
                      setNotifTypes({
                        ...notifTypes,
                        biddings: e.target.checked,
                      })
                    }
                  />
                  <span>{t('notifications.biddings')}</span>
                </label>

                <label className="check">
                  <input
                    type="checkbox"
                    checked={notifTypes.invoices}
                    disabled={!notifications}
                    onChange={(e) =>
                      setNotifTypes({
                        ...notifTypes,
                        invoices: e.target.checked,
                      })
                    }
                  />
                  <span>{t('notifications.invoices')}</span>
                </label>
              </div>
            </div>
          </section>

          {/* Store Settings */}
          <section className="settings-box">
            <h3>{t('store.title')}</h3>

            <div className="row-start gap-12">
              <span>{t('store.closeTemp')}</span>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={store.closed}
                  onChange={(e) =>
                    setStore({ ...store, closed: e.target.checked })
                  }
                />
                <span className="slider" />
              </label>
            </div>

            <div className="grid-2 mt-16">
              <label>
                <span>{t('store.closeMsg')}</span>
                <input
                  value={store.closeMsg}
                  onChange={(e) =>
                    setStore({ ...store, closeMsg: e.target.value })
                  }
                  placeholder={t('placeholders.closeMsg')}
                />
              </label>
              <label>
                <span>{t('store.city')}</span>
                <input
                  value={store.city}
                  onChange={(e) => setStore({ ...store, city: e.target.value })}
                  placeholder={t('placeholders.city')}
                />
              </label>
              <label>
                <span>{t('store.deliveryFees')}</span>
                <div className="with-unit">
                  <input
                    value={store.fees}
                    onChange={(e) =>
                      setStore({ ...store, fees: e.target.value })
                    }
                    placeholder={t('placeholders.fees')}
                  />
                  <span className="unit">SAR</span>
                </div>
              </label>
            </div>

            <div className="upload-section mt-24">
              <div
                className="upload-card"
                onClick={() => profileRef.current.click()}
              >
                <span className="upload-icon">⬆️</span>
                <p>{t('store.uploadProfile')}</p>
                <input ref={profileRef} type="file" hidden accept="image/*" />
              </div>

              <div
                className="upload-banner"
                onClick={() => bannerRef.current.click()}
              >
                <span className="upload-icon">⬆️</span>
                <p>{t('store.uploadBanner')}</p>
                <input ref={bannerRef} type="file" hidden accept="image/*" />
              </div>
            </div>

            <label className="mt-16">
              <span>{t('store.storeBio')}</span>
              <textarea
                rows={5}
                value={store.bio}
                onChange={(e) => setStore({ ...store, bio: e.target.value })}
                placeholder={t('placeholders.bio')}
              />
            </label>
          </section>

          {/* Support Section */}
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
        </div>
      </div>
    </div>
  );
}
