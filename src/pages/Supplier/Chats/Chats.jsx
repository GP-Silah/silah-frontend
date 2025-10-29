// ChatsSupplier.js
import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { FaEnvelope, FaSearch, FaPaperPlane } from 'react-icons/fa';
import './Chats.css';

export default function ChatsSupplier() {
  const { t, i18n } = useTranslation('chats');
  const navigate = useNavigate();
  const dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.dir = dir;

  // UI state
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [typeOpen, setTypeOpen] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);
  const [selectedType, setSelectedType] = useState(t('allMessages'));
  const [selectedDate, setSelectedDate] = useState(t('allDays'));

  const dropdownRef = useRef(null);

  useEffect(() => {
    document.title = t('pageTitle');
  }, [t]);

  // Demo data
  useEffect(() => {
    const demo = [
      {
        chatId: '1',
        partnerId: 'u1',
        partnerName: 'Shahad Mohammed',
        partnerAvatar: '',
        lastMessage: 'مرحباً، هل يمكنك إرسال عرض الأسعار للطلب رقم 12345؟',
        lastMessageTime: new Date().toISOString(),
        unreadCount: 2,
        isRead: false,
      },
      {
        chatId: '2',
        partnerId: 'u2',
        partnerName: 'Ahmed Ali',
        lastMessage: 'تم استلام الفاتورة، شكراً!',
        lastMessageTime: new Date(Date.now() - 86400000).toISOString(),
        unreadCount: 0,
        isRead: true,
      },
    ];
    setChats(demo);
    setLoading(false);
  }, [i18n.language]);

  // Search logic
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const lower = searchQuery.toLowerCase();
    const chatsRes = chats.filter((c) =>
      c.partnerName.toLowerCase().includes(lower),
    );

    const usersRes = [
      { userId: 'u3', name: 'Shahad Saad' },
      { userId: 'u4', name: 'Shahad Ahmed' },
    ].filter((u) => u.name.toLowerCase().includes(lower));

    setSearchResults([
      ...chatsRes,
      ...usersRes.map((u) => ({ ...u, isNewUser: true })),
    ]);
    setIsSearching(true);
  }, [searchQuery, chats]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setTypeOpen(false);
        setDateOpen(false);
      }
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  // Mark chat as read
  const markChatRead = (chatId) => {
    setChats((prev) =>
      prev.map((c) =>
        c.chatId === chatId ? { ...c, isRead: true, unreadCount: 0 } : c,
      ),
    );
  };

  const openChat = (chatId) => {
    markChatRead(chatId);
    navigate(`/supplier/chats/${chatId}`);
  };

  const startNewChat = (userId) => {
    navigate(`/supplier/chats/new?with=${userId}`);
  };

  // Filter logic
  const filtered = chats.filter((c) => {
    if (selectedType !== t('allMessages')) {
      const map = { [t('unreadMessages')]: false, [t('readMessages')]: true };
      const expected = map[selectedType];
      if (expected !== undefined && c.isRead !== expected) return false;
    }
    if (selectedDate !== t('allDays')) {
      const now = new Date();
      const msg = new Date(c.lastMessageTime);
      if (selectedDate === t('today') && !isSameDay(msg, now)) return false;
      if (selectedDate === t('thisWeek') && !isThisWeek(msg)) return false;
      if (selectedDate === t('thisMonth') && msg.getMonth() !== now.getMonth())
        return false;
    }
    return true;
  });

  const displayList = isSearching ? searchResults : filtered;

  return (
    <div className="chats-page" data-dir={dir}>
      {/* HEADER */}
      <div className="chats-header">
        {/* Search Bar (Full Width, Purple BG) */}
        <div className="chats-search-bar">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder={t('searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Filters (Top-Right) */}
        <div className="chats-filters-right" ref={dropdownRef}>
          <div className="chats-filter-inline">
            <span className="chats-filter-label">{t('type')}</span>
            <div className="page-dropdown">
              <button onClick={() => setTypeOpen((p) => !p)}>
                {selectedType} ▼
              </button>
              {typeOpen && (
                <div className="page-dropdown-menu page-type-menu">
                  {[
                    t('allMessages'),
                    t('unreadMessages'),
                    t('readMessages'),
                  ].map((opt) => (
                    <div
                      key={opt}
                      className="page-dropdown-item"
                      onClick={() => {
                        setSelectedType(opt);
                        setTypeOpen(false);
                      }}
                    >
                      {opt}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="chats-filter-inline">
            <span className="chats-filter-label">{t('date')}</span>
            <div className="page-dropdown">
              <button onClick={() => setDateOpen((p) => !p)}>
                {selectedDate} ▼
              </button>
              {dateOpen && (
                <div className="page-dropdown-menu page-date-menu">
                  {[
                    t('allDays'),
                    t('today'),
                    t('thisWeek'),
                    t('thisMonth'),
                  ].map((opt) => (
                    <div
                      key={opt}
                      className="page-dropdown-item"
                      onClick={() => {
                        setSelectedDate(opt);
                        setDateOpen(false);
                      }}
                    >
                      {opt}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* SEARCH RESULTS OR CHAT LIST */}
      <div className="chats-list">
        {loading ? (
          <div className="chats-loading">{t('loading')}</div>
        ) : displayList.length === 0 ? (
          <div className="chats-empty">
            {isSearching ? t('noSearchResults') : t('noChats')}
          </div>
        ) : (
          <>
            {isSearching}
            {displayList.map((item, index) => {
              const isNewUser = item.isNewUser;
              const isLastChat =
                isSearching &&
                !isNewUser &&
                index < displayList.length - 1 &&
                displayList[index + 1].isNewUser;
              return (
                <React.Fragment key={item.chatId || item.userId}>
                  <div
                    className={`chats-item ${
                      item.isRead === false ? 'chats-unread' : ''
                    }`}
                    onClick={() =>
                      item.isNewUser
                        ? startNewChat(item.userId)
                        : openChat(item.chatId)
                    }
                  >
                    {!item.isRead && <span className="chats-unread-dot" />}

                    <div className="chats-avatar-circle">
                      {item.partnerAvatar || item.avatar ? (
                        <img
                          src={item.partnerAvatar || item.avatar}
                          alt={item.partnerName || item.name}
                        />
                      ) : (
                        <FaEnvelope />
                      )}
                    </div>

                    <div className="chats-content">
                      <div className="chats-title">
                        {item.partnerName || item.name}
                      </div>
                      <div className="chats-message">
                        {item.lastMessage
                          ? item.lastMessage.length > 60
                            ? `${item.lastMessage.slice(0, 60)}...`
                            : item.lastMessage
                          : t('startNewChat')}
                      </div>
                    </div>

                    {item.lastMessageTime && (
                      <div className="chats-meta">
                        <div className="chats-date">
                          {formatDate(item.lastMessageTime, i18n.language)}
                        </div>
                        <div className="chats-time">
                          {formatTime(item.lastMessageTime)}
                        </div>
                        {item.unreadCount > 0 && (
                          <div className="chats-unread-badge">
                            {item.unreadCount}
                          </div>
                        )}
                      </div>
                    )}

                    {item.isNewUser && (
                      <button className="chats-start-btn">
                        <FaPaperPlane />
                      </button>
                    )}
                  </div>
                  {isLastChat && <hr className="chats-search-divider" />}
                </React.Fragment>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}

/* HELPERS */
const formatDate = (iso, lang) => {
  const d = new Date(iso);
  return d.toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const formatTime = (iso) => {
  return new Date(iso).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
};

const isSameDay = (d1, d2) => d1.toDateString() === d2.toDateString();

const isThisWeek = (d) => {
  const today = new Date();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay());
  return d >= weekStart;
};
