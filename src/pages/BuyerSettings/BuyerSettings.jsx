import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Sidebar from '../../components/Sidebar/Sidebar';
import './BuyerSettings.css';
import BuyerSettingsPayment from './BuyerSettingsPayment';
import TapCardForm from '../../components/TapCardForm';

export default function BuyerSettings() {
  const { t, i18n } = useTranslation('buyerSettings');
  const [activeTab, setActiveTab] = useState('general');

  const [user, setUser] = useState({ name: '', nid: '' });
  const [biz, setBiz] = useState({ name: '', crn: '', city: '', activity: '' });
  const [email, setEmail] = useState('');
  const [password] = useState('********');
  const [notifications, setNotifications] = useState(true);
  const [notifTypes, setNotifTypes] = useState({
    messages: true,
    invoices: true,
    bids: true,
    orders: true,
    groups: true,
  });

  const profileRef = useRef(null);

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
                    <span>{t('businessInfo.city')}</span>
                    <input
                      value={biz.city}
                      onChange={(e) => setBiz({ ...biz, city: e.target.value })}
                      placeholder={t('placeholders.city')}
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
              <button
                type="button"
                className="btn-primary mt-12"
                onClick={() => alert(t('actions.demo'))}
              >
                {t('account.changePassword')}
              </button>

              <div className="upload-section mt-24">
                <div
                  className="upload-card"
                  onClick={() => profileRef.current.click()}
                >
                  <span className="upload-icon">⬆️</span>
                  <p>{t('account.upload')}</p>
                  <input ref={profileRef} type="file" hidden accept="image/*" />
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
              <h3>Payment Method</h3>
              <TapCardForm />
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
        </div>
      </div>
    </div>
  );
}
