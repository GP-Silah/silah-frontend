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

  useEffect(() => inputRef.current?.focus(), []);

  useEffect(() => {
    document.title = t('chatWith', { otherUser: partner?.name });
  }, [t, partner?.name]);

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

  // === MAIN SETUP ===
  useEffect(() => {
    if (isNewChat) {
      if (!receiverId || !partnerFromState) return navigate('/supplier/chats');
      setPartner(partnerFromState);
      setLoading(false);
    } else {
      setCurrentChatId(chatId);
      socket.emit('join_chat', chatId); // JOIN EARLY

      Promise.all([loadMessages(chatId), loadChatInfo(chatId)])
        .then(([msgs]) => setMessages(msgs))
        .finally(() => setLoading(false));
    }

    return () => {
      if (currentChatId) socket.emit('leave_chat', currentChatId);
    };
  }, [
    chatId,
    isNewChat,
    receiverId,
    navigate,
    currentChatId,
    partnerFromState,
  ]);

  // === SOCKET ===
  useEffect(() => {
    if (!currentUserId) return;

    const handleNewMessage = (data) => {
      const msg = data.message || data;
      console.log('=== NEW_MESSAGE DEBUG ===');
      console.log('- senderId:', msg.senderId);
      console.log('- currentUserId:', currentUserId);
      console.log('- Full msg:', JSON.stringify(msg, null, 2));

      if (!msg?.messageId) return;

      // === BLOCK MY MESSAGES ===
      if (msg.senderId === currentUserId) {
        console.log('🚫 BLOCKED: new_message from ME');
        return;
      }

      // New chat handling...
      if (isNewChat && msg.chatId && !currentChatId) {
        // ... unchanged
        return;
      }

      // === DUPLICATE CHECK ===
      const alreadyExists = messages.some((m) => m.messageId === msg.messageId);
      if (alreadyExists) {
        console.log('🚫 BLOCKED: duplicate messageId:', msg.messageId);
        return;
      }

      console.log('✅ ADDING incoming message');
      setMessages((prev) => [
        ...prev,
        {
          messageId: msg.messageId,
          text: msg.text || null,
          senderId: msg.senderId, // ← TRUST THIS (it's OTHER user)
          createdAt: msg.createdAt,
          imageUrl: msg.imageUrl || null,
          isRead: msg.isRead || false,
        },
      ]);
    };

    socket.on('new_message', handleNewMessage);
    return () => socket.off('new_message', handleNewMessage);
  }, [currentUserId, isNewChat, currentChatId, navigate, messages]);

  // === SEND TEXT ===
  const sendMessage = () => {
    if (!input.trim() || !currentUserId) return;

    const tempId = `temp-${Date.now()}`;
    const payload = { text: input };
    if (isNewChat) payload.receiverId = receiverId;
    else {
      payload.chatId = currentChatId;
      payload.receiverId = partner?.userId;
    }

    // OPTIMISTIC (ALWAYS SENT)
    setMessages((prev) => [
      ...prev,
      {
        messageId: tempId,
        text: input,
        senderId: currentUserId, // ← FORCE THIS
        createdAt: new Date().toISOString(),
        imageUrl: null,
        isRead: false,
      },
    ]);

    socket.emit('send_message', payload, (ack) => {
      console.log('=== ACK FULL DATA ===', JSON.stringify(ack, null, 2));

      if (!ack?.message) {
        console.log('NO ACK MESSAGE');
        return;
      }

      const backendMsg = ack.message;

      // === CRITICAL: FORCE SENDER = ME ===
      setMessages((prev) => {
        const idx = prev.findIndex((m) => m.messageId === tempId);
        if (idx === -1) return prev;

        const updated = [...prev];
        updated[idx] = {
          messageId: backendMsg.messageId,
          text: backendMsg.text,
          senderId: currentUserId, // ← FORCE MY ID
          createdAt: backendMsg.createdAt,
          imageUrl: backendMsg.imageUrl || null,
          isRead: true,
        };
        return updated;
      });
    });

    setInput('');
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
      console.log('IMAGE UPLOADED');
    } catch (err) {
      alert('Failed to send image.');
      setMessages((prev) => prev.filter((m) => m.messageId !== tempId));
    }
  };

  if (loading || !currentUserId)
    return <div className="chat-loading">{t('loading')}</div>;

  return (
    <div className="chat-detail">
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
          onClick={() =>
            navigate(`/supplier/invoices/new?buyer=${partner?.userId}`)
          }
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
          <div className="invoice-label">Create an Invoice</div>
        </button>
      </div>

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
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input">
        <input
          ref={inputRef}
          type="text"
          placeholder={t('typeMessage')}
          value={input}
          onChange={(e) => setInput(e.target.value)}
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
