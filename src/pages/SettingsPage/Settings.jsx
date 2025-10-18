import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Sidebar from '../../components/Sidebar/Sidebar';
import './Settings.css';

export default function SupplierSettings() {
  const { t, i18n } = useTranslation('settings');
  const [activeTab, setActiveTab] = useState('general');

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
      {/* Sidebar ثابت */}
      <div className="sidebar-fixed">
        <Sidebar />
      </div>
      {/* المحتوى الرئيسي */}
      <div className="page-content" dir={i18n.dir()}>
        <div className="settings-container">
          <h2 className="settings-title">{t('pageTitle.settings')}</h2>{' '}
          {/* 🔹 التبويبات */}
          <div className="settings-tabs">
            {['general', 'account', 'notifications', 'store', 'support'].map(
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
          {/* 🟣 General Tab */}
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
                    <input
                      value={user.nid}
                      onChange={(e) =>
                        setUser({ ...user, nid: e.target.value })
                      }
                      placeholder={t('placeholders.nid')}
                    />
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
                      onChange={(e) =>
                        setBiz({ ...biz, activity: e.target.value })
                      }
                      placeholder={t('placeholders.activity')}
                    />
                  </label>
                </div>
              </section>
            </>
          )}
          {/* 🟣 Account Tab */}
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
              <button
                type="button"
                className="btn-primary mt-12"
                onClick={() => alert(t('actions.demo'))}
              >
                {t('account.changePassword')}
              </button>
            </section>
          )}
          {/* 🟣 Notifications Tab */}
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
          {/* 🟣 Store Tab */}
          {activeTab === 'store' && (
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
                    onChange={(e) =>
                      setStore({ ...store, city: e.target.value })
                    }
                    placeholder={t('placeholders.city')}
                  />
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
            </section>
          )}
          {/* 🟣 Support Tab */}
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
        </div>
      </div>
    </div>
  );
}
