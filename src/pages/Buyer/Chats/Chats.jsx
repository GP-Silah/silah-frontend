import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { FaEnvelope, FaSearch, FaPaperPlane } from 'react-icons/fa';
import axios from 'axios';
import { socket } from '../../../utils/socket';
import styles from './Chats.module.css';

const API_BASE = import.meta.env.VITE_BACKEND_URL || 'https://api.silah.site';

export default function ChatsSupplier() {
  const { t, i18n } = useTranslation('chats');
  const navigate = useNavigate();
  const dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.dir = dir;

  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [typeOpen, setTypeOpen] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);
  const [selectedType, setSelectedType] = useState(t('allMessages'));
  const [selectedDate, setSelectedDate] = useState(t('allDays'));

  const dropdownRef = useRef(null);
  const searchTimeout = useRef(null);
  const socketInitialized = useRef(false);

  useEffect(() => {
    document.title = t('pageTitle');
  }, [t]);

  // Socket: new message real-time update
  useEffect(() => {
    if (socketInitialized.current) return;

    socket.on('new_message', (data) => {
      const msg = data.message || data;
      if (!msg?.chatId) return;

      setChats((prev) => {
        const updated = [...prev];
        const chatIndex = updated.findIndex((c) => c.chatId === msg.chatId);

        if (chatIndex === -1) {
          fetchChats();
          return prev;
        }

        const chat = updated[chatIndex];
        updated[chatIndex] = {
          ...chat,
          lastMessage: msg.text || t('imageMessage'),
          lastMessageTime: msg.createdAt,
          unreadCount: chat.unreadCount + 1,
          isRead: false,
        };

        // Move to top
        updated.splice(chatIndex, 1);
        updated.unshift(updated[chatIndex]);
        return updated;
      });
    });

    socketInitialized.current = true;
  }, [t]);

  const fetchChats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();

      if (selectedDate !== t('allDays')) {
        const map = {
          [t('today')]: 'today',
          [t('thisWeek')]: 'this-week',
          [t('thisMonth')]: 'this-month',
        };
        params.append('date', map[selectedDate]);
      }

      if (selectedType !== t('allMessages')) {
        const map = {
          [t('unreadMessages')]: 'unread',
          [t('readMessages')]: 'read',
        };
        params.append('status', map[selectedType]);
      }

      const res = await axios.get(`${API_BASE}/api/chats/me`, {
        params,
        withCredentials: true,
      });

      const formatted = res.data.map((chat) => {
        const draftKey = `chat_draft_${chat.chatId}`;
        const draft = localStorage.getItem(draftKey) || '';

        return {
          chatId: chat.chatId,
          partnerId: chat.otherUser.userId,
          partnerName: chat.otherUser.businessName || chat.otherUser.name,
          partnerAvatar: chat.otherUser.pfpUrl || '',
          lastMessage: draft
            ? `${t('draft')}: ${draft}`
            : chat.lastMessageIsImage
            ? t('imageMessage')
            : chat.lastMessageText || '',
          lastMessageTime: chat.lastMessageAt,
          unreadCount: chat.unreadCount || 0,
          categories: chat.otherUser.categories || [],
          isRead: (chat.unreadCount || 0) === 0,
          hasDraft: !!draft,
        };
      });

      setChats(formatted);
    } catch (err) {
      setError(t('errorLoadingChats'));
      console.error('Failed to load chats:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedType, selectedDate, t]);

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  // Search (debounced)
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    searchTimeout.current = setTimeout(async () => {
      try {
        const [chatRes, userRes] = await Promise.all([
          axios.get(`${API_BASE}/api/search/chats`, {
            params: { text: searchQuery },
            withCredentials: true,
          }),
          axios.get(`${API_BASE}/api/search/users`, {
            params: { name: searchQuery },
            withCredentials: true,
          }),
        ]);

        const chatResults = chatRes.data.map((chat) => {
          const draftKey = `chat_draft_${chat.chatId}`;
          const draft = localStorage.getItem(draftKey) || '';
          return {
            chatId: chat.chatId,
            partnerId: chat.otherUser.userId,
            partnerName: chat.otherUser.businessName || chat.otherUser.name,
            partnerAvatar: chat.otherUser.pfpUrl || '',
            lastMessage: draft
              ? `${t('draft')}: ${draft}`
              : chat.lastMessageIsImage
              ? t('imageMessage')
              : chat.lastMessageText || '',
            hasDraft: !!draft,
            lastMessageTime: chat.lastMessageAt,
            unreadCount: chat.unreadCount || 0,
            isRead: (chat.unreadCount || 0) === 0,
            categories: chat.otherUser.categories || [],
            isNewUser: false,
          };
        });

        const userResults = userRes.data
          .filter(
            (user) => !chatResults.some((c) => c.partnerId === user.userId),
          )
          .map((user) => ({
            userId: user.userId,
            partnerName: user.businessName || user.name,
            partnerAvatar: user.pfpUrl || '',
            categories: user.categories || [],
            isNewUser: true,
          }));

        setSearchResults([...chatResults, ...userResults]);
        setIsSearching(true);
      } catch (err) {
        console.error('Search failed:', err);
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(searchTimeout.current);
  }, [searchQuery, t]);

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

  const openChat = (chatId) => {
    navigate(`/supplier/chats/${chatId}`);
  };

  const startNewChat = (userId, partnerData) => {
    navigate(`/supplier/chats/new?with=${userId}`, {
      state: { partner: partnerData },
    });
  };

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
    <div className={styles['chats-page']} data-dir={dir}>
      {/* Header */}
      <div className={styles['chats-header']}>
        <div className={styles['chats-search-bar']}>
          <FaSearch className={styles['search-icon']} />
          <input
            type="text"
            placeholder={t('searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className={styles['chats-filters-right']} ref={dropdownRef}>
          {/* Type Filter */}
          <div className={styles['chats-filter-inline']}>
            <span className={styles['chats-filter-label']}>{t('type')}</span>
            <div className={styles['page-dropdown']}>
              <button onClick={() => setTypeOpen((p) => !p)}>
                {selectedType} ▼
              </button>
              {typeOpen && (
                <div
                  className={`${styles['page-dropdown-menu']} ${styles['page-type-menu']}`}
                >
                  {[
                    t('allMessages'),
                    t('unreadMessages'),
                    t('readMessages'),
                  ].map((opt) => (
                    <div
                      key={opt}
                      className={styles['page-dropdown-item']}
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

          {/* Date Filter */}
          <div className={styles['chats-filter-inline']}>
            <span className={styles['chats-filter-label']}>{t('date')}</span>
            <div className={styles['page-dropdown']}>
              <button onClick={() => setDateOpen((p) => !p)}>
                {selectedDate} ▼
              </button>
              {dateOpen && (
                <div
                  className={`${styles['page-dropdown-menu']} ${styles['page-date-menu']}`}
                >
                  {[
                    t('allDays'),
                    t('today'),
                    t('thisWeek'),
                    t('thisMonth'),
                  ].map((opt) => (
                    <div
                      key={opt}
                      className={styles['page-dropdown-item']}
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

      {/* Chats List */}
      <div className={styles['chats-list']}>
        {loading ? (
          <div className={styles['chats-loading']}>{t('loading')}</div>
        ) : error ? (
          <div className={styles['chats-error']}>{error}</div>
        ) : displayList.length === 0 ? (
          <div className={styles['chats-empty']}>
            {isSearching ? t('noSearchResults') : t('noChats')}
          </div>
        ) : (
          <>
            {displayList
              .filter((item) => !item.isNewUser)
              .map((item, index, arr) => (
                <React.Fragment key={item.chatId}>
                  <div
                    className={`${styles['chats-item']} ${
                      !item.isRead ? styles['chats-unread'] : ''
                    }`}
                    onClick={() => openChat(item.chatId)}
                  >
                    {!item.isRead && (
                      <span className={styles['chats-unread-dot']} />
                    )}
                    <div className={styles['chats-avatar-circle']}>
                      {item.partnerAvatar ? (
                        <img src={item.partnerAvatar} alt={item.partnerName} />
                      ) : (
                        <FaEnvelope />
                      )}
                    </div>
                    <div className={styles['chats-content']}>
                      <div className={styles['chats-title']}>
                        {item.partnerName}
                      </div>
                      <div
                        className={`${styles['chats-message']} ${
                          item.hasDraft ? styles.draft : ''
                        }`}
                      >
                        {item.lastMessage.length > 60
                          ? `${item.lastMessage.slice(0, 60)}...`
                          : item.lastMessage}
                      </div>
                    </div>
                    <div className={styles['chats-meta']}>
                      <div className={styles['chats-date']}>
                        {formatDate(item.lastMessageTime, i18n.language)}
                      </div>
                      <div className={styles['chats-time']}>
                        {formatTime(item.lastMessageTime)}
                      </div>
                      {item.unreadCount > 0 && (
                        <div className={styles['chats-unread-badge']}>
                          {item.unreadCount}
                        </div>
                      )}
                    </div>
                  </div>

                  {isSearching &&
                    index === arr.length - 1 &&
                    searchResults.some((r) => r.isNewUser) && (
                      <hr className={styles['chats-search-divider-full']} />
                    )}
                </React.Fragment>
              ))}

            {/* New User Results */}
            {isSearching &&
              searchResults
                .filter((item) => item.isNewUser)
                .map((item) => (
                  <div
                    key={item.userId}
                    className={styles['chats-item']}
                    onClick={() =>
                      startNewChat(item.userId, {
                        userId: item.userId,
                        name: item.partnerName,
                        avatar: item.partnerAvatar,
                        categories: item.categories,
                      })
                    }
                  >
                    <div className={styles['chats-avatar-circle']}>
                      {item.partnerAvatar ? (
                        <img src={item.partnerAvatar} alt={item.partnerName} />
                      ) : (
                        <FaEnvelope />
                      )}
                    </div>
                    <div className={styles['chats-content']}>
                      <div className={styles['chats-title']}>
                        {item.partnerName}
                      </div>
                      <div className={styles['chats-message']}>
                        {t('startNewChat')}
                      </div>
                    </div>
                    <button className={styles['chats-start-btn']}>
                      <FaPaperPlane />
                    </button>
                  </div>
                ))}
          </>
        )}
      </div>
    </div>
  );
}

// Helpers
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
