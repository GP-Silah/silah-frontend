import React, { useState, useEffect, useRef } from 'react';
import {
  useParams,
  useSearchParams,
  useNavigate,
  useLocation,
} from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  FaPaperPlane,
  FaImage,
  FaFileInvoiceDollar,
  FaEnvelope,
} from 'react-icons/fa';
import axios from 'axios';
import { socket } from '../../../utils/socket';
import './Chat.css';

const API_BASE = import.meta.env.VITE_BACKEND_URL || 'https://api.silah.site';

export default function ChatDetail() {
  const { t } = useTranslation('chats');
  const { id: chatId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  const isNewChat = chatId === 'new';
  const receiverId = searchParams.get('with');
  const partnerFromState = location.state?.partner;

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [partner, setPartner] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [currentChatId, setCurrentChatId] = useState(null);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Update page title
  useEffect(() => {
    document.title = t('chatWith', { otherUser: partner?.name });
  }, [t, partner?.name]);

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  useEffect(() => scrollToBottom(), [messages]);

  // === GET CURRENT USER ===
  useEffect(() => {
    axios
      .get(`${API_BASE}/api/users/me`, { withCredentials: true })
      .then((res) => setCurrentUserId(res.data.userId))
      .catch(() => navigate('/supplier/chats'));
  }, [navigate]);

  // === LOAD MESSAGES ===
  const loadMessages = async (id) => {
    try {
      const res = await axios.get(`${API_BASE}/api/chats/me/${id}/messages`, {
        withCredentials: true,
      });
      return res.data.map((m) => ({
        messageId: m.messageId,
        text: m.text,
        senderId: m.sender.userId,
        createdAt: m.createdAt,
        imageUrl: m.imageUrl,
        isRead: m.isRead,
      }));
    } catch (err) {
      console.error('Load messages failed:', err);
      return [];
    }
  };

  // === LOAD CHAT INFO ===
  const loadChatInfo = async (id) => {
    try {
      const res = await axios.get(`${API_BASE}/api/chats/me/${id}`, {
        withCredentials: true,
      });
      const chat = res.data;
      setPartner({
        userId: chat.otherUser.userId,
        name: chat.otherUser.businessName || chat.otherUser.name,
        avatar: chat.otherUser.pfpUrl,
        categories: chat.otherUser.categories || [],
      });
    } catch (err) {
      console.error('Load chat info failed:', err);
    }
  };

  /**
   * Sends a PATCH request to mark every *received* (not sent by me) message
   * that is still `isRead: false` as read.
   */
  const markReceivedMessagesAsReadBulk = async (chatId) => {
    if (!chatId || isNewChat) return;

    const unreadMessageIds = messages
      .filter((m) => m.senderId !== currentUserId && !m.isRead)
      .map((m) => m.messageId);

    if (unreadMessageIds.length === 0) return;

    try {
      const res = await axios.patch(
        `${API_BASE}/api/chats/me/${chatId}/read`,
        { messageIds: unreadMessageIds },
        { withCredentials: true },
      );

      console.log(
        `✅ Marked ${res.data.updatedCount} message(s) as read`,
        res.data.message,
      );

      // Optimistically update UI
      setMessages((prev) =>
        prev.map((m) =>
          unreadMessageIds.includes(m.messageId) ? { ...m, isRead: true } : m,
        ),
      );
    } catch (err) {
      console.error('❌ Failed to mark messages as read', err);
    }
  };

  // === MAIN SETUP ===
  useEffect(() => {
    if (isNewChat) {
      if (!receiverId || !partnerFromState) return navigate('/supplier/chats');
      setPartner(partnerFromState);
      setLoading(false);
      return;
    }

    setCurrentChatId(chatId);
    socket.emit('join_chat', chatId);

    Promise.all([loadMessages(chatId), loadChatInfo(chatId)])
      .then(([msgs]) => {
        setMessages(msgs);
      })
      .finally(() => setLoading(false));

    return () => {
      if (currentChatId) socket.emit('leave_chat', currentChatId);
    };
  }, [chatId, isNewChat, receiverId, navigate, partnerFromState]);

  // === AUTO MARK AS READ WHEN MESSAGES ARE LOADED ===
  useEffect(() => {
    if (!currentChatId || isNewChat || messages.length === 0 || !currentUserId)
      return;

    const timer = setTimeout(() => {
      markReceivedMessagesAsReadBulk(currentChatId);
    }, 100);

    return () => clearTimeout(timer);
  }, [messages, currentChatId, currentUserId]);

  // === DRAFT STORAGE HELPERS ===
  const getDraftKey = (id) => `chat_draft_${id}`;

  // Save draft on every input change
  const handleInputChange = (e) => {
    const value = e.target.value;
    setInput(value);

    const key = isNewChat
      ? getDraftKey(`new_${receiverId}`)
      : getDraftKey(currentChatId);

    if (key) {
      localStorage.setItem(key, value);
    }
  };

  // Load draft when chat is ready
  useEffect(() => {
    if (isNewChat && receiverId) {
      const draft = localStorage.getItem(getDraftKey(`new_${receiverId}`));
      if (draft) setInput(draft);
    } else if (currentChatId) {
      const draft = localStorage.getItem(getDraftKey(currentChatId));
      if (draft) setInput(draft);
    }
  }, [isNewChat, receiverId, currentChatId]);

  // === SOCKET: Receive new messages ===
  useEffect(() => {
    if (!currentUserId) return;

    const handleNewMessage = (data) => {
      const msg = data.message || data;
      if (!msg?.messageId) return;

      const senderId = msg.senderId || msg.sender?.userId;
      if (!senderId || senderId === currentUserId) return;

      const alreadyExists = messages.some((m) => m.messageId === msg.messageId);
      if (alreadyExists) return;

      // Add the incoming message
      setMessages((prev) => [
        ...prev,
        {
          messageId: msg.messageId,
          text: msg.text || null,
          senderId,
          createdAt: msg.createdAt,
          imageUrl: msg.imageUrl || null,
          isRead: msg.isRead ?? false,
        },
      ]);

      // Debounced mark all unread as read
      if (!msg.isRead && currentChatId) {
        clearTimeout(window._readTimeout);
        window._readTimeout = setTimeout(() => {
          markReceivedMessagesAsReadBulk(currentChatId);
        }, 500);
      }
    };

    socket.on('new_message', handleNewMessage);
    return () => {
      socket.off('new_message', handleNewMessage);
      clearTimeout(window._readTimeout);
    };
  }, [currentUserId, currentChatId]);

  // === SEND TEXT MESSAGE ===
  const sendMessage = () => {
    if (!input.trim() || !currentUserId) return;

    const tempId = `temp-${Date.now()}`;
    const payload = { text: input };
    if (isNewChat) {
      payload.receiverId = receiverId;
    } else {
      payload.chatId = currentChatId;
      payload.receiverId = partner?.userId;
    }

    // 1. Optimistic UI
    setMessages((prev) => [
      ...prev,
      {
        messageId: tempId,
        text: input,
        senderId: currentUserId,
        createdAt: new Date().toISOString(),
        imageUrl: null,
        isRead: false,
      },
    ]);

    // 2. CLEAR INPUT + DRAFT IMMEDIATELY
    setInput('');
    const draftKey = isNewChat
      ? getDraftKey(`new_${receiverId}`)
      : getDraftKey(currentChatId);
    localStorage.removeItem(draftKey);

    // 3. Send via socket
    socket.emit('send_message', payload, (ack) => {
      console.log('ACK received:', ack);

      if (!ack?.message) return;

      const backendMsg = ack.message;
      const newChatIdFromServer = backendMsg.chatId;

      // Replace temp message
      setMessages((prev) => {
        const idx = prev.findIndex((m) => m.messageId === tempId);
        if (idx === -1) return prev;
        const updated = [...prev];
        updated[idx] = {
          messageId: backendMsg.messageId,
          text: backendMsg.text,
          senderId: currentUserId,
          createdAt: backendMsg.createdAt,
          imageUrl: backendMsg.imageUrl || null,
          isRead: true,
        };
        return updated;
      });

      // Handle new chat → real chat
      if (isNewChat && newChatIdFromServer) {
        setCurrentChatId(newChatIdFromServer);
        navigate(`/supplier/chats/${newChatIdFromServer}`, { replace: true });

        setTimeout(
          () => markReceivedMessagesAsReadBulk(newChatIdFromServer),
          500,
        );
      }
    });
  };

  // === SEND IMAGE ===
  const sendImage = async (file) => {
    if (!file || isNewChat || !currentChatId) {
      alert('Send a text message first.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Max 5MB.');
      return;
    }

    const tempId = `temp-${Date.now()}`;
    const previewUrl = URL.createObjectURL(file);

    setMessages((prev) => [
      ...prev,
      {
        messageId: tempId,
        text: null,
        senderId: currentUserId,
        createdAt: new Date().toISOString(),
        imageUrl: previewUrl,
        isRead: true,
      },
    ]);

    const formData = new FormData();
    formData.append('file', file);

    try {
      await axios.post(
        `${API_BASE}/api/chats/me/${currentChatId}/upload`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          withCredentials: true,
        },
      );
    } catch (err) {
      alert('Failed to send image.');
      setMessages((prev) => prev.filter((m) => m.messageId !== tempId));
    }
  };

  // === CHECK FOR DRAFT ===
  const hasInvoiceDraft = () => {
    if (!partner?.userId) return false;
    const key = `invoice_draft_${partner.userId}`;
    return !!localStorage.getItem(key);
  };

  // === LOADING STATE ===
  if (loading || !currentUserId)
    return <div className="chat-loading">{t('loading')}</div>;

  // === RENDER ===
  return (
    <div className="chat-detail">
      {/* HEADER */}
      <div className="chat-header">
        <div className="chat-header-left">
          <div className="partner-avatar">
            {partner?.avatar ? (
              <img src={partner.avatar} alt={partner.name} />
            ) : (
              <FaEnvelope />
            )}
          </div>
          <div className="partner-info">
            <div className="partner-name">{partner?.name}</div>
            <div className="partner-activity">
              {partner?.categories?.length > 0
                ? partner.categories.map((c) => c.name).join(' • ')
                : 'No categories'}
            </div>
          </div>
        </div>

        <button
          className="chat-header-right"
          onClick={() => {
            const draftKey = `invoice_draft_${partner?.userId}`;
            const draft = localStorage.getItem(draftKey);
            if (draft) {
              navigate(`/supplier/invoices/new?userId=${partner?.userId}`);
            } else {
              navigate(`/supplier/invoices/new?userId=${partner?.userId}`);
            }
          }}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '14px',
            color: '#007bff',
          }}
        >
          <div className="invoice-icon">
            <FaFileInvoiceDollar />
          </div>
          <div className="invoice-label">
            {hasInvoiceDraft() ? t('continueInvoice') : t('createInvoice')}
          </div>
        </button>
      </div>

      {/* MESSAGES */}
      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="no-messages">{t('noMessagesYet')}</div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.messageId}
              className={`message ${
                msg.senderId === currentUserId ? 'sent' : 'received'
              }`}
            >
              {msg.text && <div className="message-text">{msg.text}</div>}
              {msg.imageUrl && (
                <img src={msg.imageUrl} alt="sent" className="message-image" />
              )}
              <div className="message-time">
                {new Date(msg.createdAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>

              {/* READ RECEIPT: ONLY ON MESSAGES *I SENT* */}
              {/* {msg.senderId === currentUserId && (
                <div className="read-receipt">
                  {msg.isRead ? 'Seen' : 'Delivered'}
                </div>
              )} */}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* INPUT */}
      <div className="chat-input">
        <input
          ref={inputRef}
          type="text"
          placeholder={t('typeMessage')}
          value={input}
          onChange={handleInputChange}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
        />

        <label className="upload-btn">
          <FaImage />
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            style={{ display: 'none' }}
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) sendImage(file);
              e.target.value = '';
            }}
          />
        </label>

        <button
          className="send-btn"
          onClick={sendMessage}
          disabled={!input.trim()}
        >
          <FaPaperPlane />
        </button>
      </div>
    </div>
  );
}
