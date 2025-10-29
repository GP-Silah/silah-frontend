import React, { useState, useEffect, useRef } from 'react';
import {
  useParams,
  useSearchParams,
  useNavigate,
  useLocation,
} from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaPaperPlane, FaImage, FaFileInvoiceDollar } from 'react-icons/fa';
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
  const fileInputRef = useRef(null);

  // Auto-focus
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  useEffect(() => scrollToBottom(), [messages]);

  // === CURRENT USER ===
  useEffect(() => {
    axios
      .get(`${API_BASE}/api/users/me`, { withCredentials: true })
      .then((res) => setCurrentUserId(res.data.userId))
      .catch(() => navigate('/supplier/chats'));
  }, [navigate]);

  // === LOAD MESSAGES (EXISTING CHAT) ===
  const loadMessages = async (id) => {
    try {
      const res = await axios.get(`${API_BASE}/api/chats/me/${id}/messages`, {
        withCredentials: true,
      });
      const msgs = res.data.map((m) => ({
        messageId: m.messageId,
        text: m.text,
        senderId: m.sender.userId,
        createdAt: m.createdAt,
        imageUrl: m.imageUrl,
        isRead: m.isRead,
      }));
      setMessages(msgs);

      // Mark unread messages as read
      const unreadIds = msgs
        .filter((m) => !m.isRead && m.senderId !== currentUserId)
        .map((m) => m.messageId);
      if (unreadIds.length > 0) {
        await axios.patch(
          `${API_BASE}/api/chats/me/${id}/read`,
          { messageIds: unreadIds },
          { withCredentials: true },
        );
      }
    } catch (err) {
      console.error('Failed to load messages:', err);
    }
  };

  // === FETCH CHAT OR USER ===
  useEffect(() => {
    if (isNewChat) {
      if (!receiverId || !partnerFromState) return navigate('/supplier/chats');

      setPartner({
        userId: partnerFromState.userId,
        name: partnerFromState.name,
        avatar: partnerFromState.avatar,
      });
      setLoading(false);
    } else {
      axios
        .get(`${API_BASE}/api/chats/${chatId}`, { withCredentials: true })
        .then((res) => {
          const chat = res.data;
          setPartner({
            userId: chat.otherUser.userId,
            name: chat.otherUser.businessName || chat.otherUser.name,
            avatar: chat.otherUser.pfpUrl,
          });
          setCurrentChatId(chatId);
          socket.emit('join_chat', chatId);
          loadMessages(chatId); // ← Load messages
          setLoading(false);
        })
        .catch(() => navigate('/supplier/chats'));
    }

    return () => {
      if (currentChatId) {
        socket.emit('leave_chat', currentChatId);
      }
    };
  }, [
    chatId,
    isNewChat,
    receiverId,
    navigate,
    currentChatId,
    partnerFromState,
  ]);

  // === SOCKET: NEW MESSAGE ===
  useEffect(() => {
    const handleNewMessage = (data) => {
      const msg = data.message || data;
      if (msg.chatId !== currentChatId && !isNewChat) return;

      setMessages((prev) => {
        if (prev.some((m) => m.messageId === msg.messageId)) return prev;
        return [
          ...prev,
          {
            messageId: msg.messageId,
            text: msg.text,
            senderId: msg.sender.id,
            createdAt: msg.createdAt,
            imageUrl: msg.imageUrl,
            isRead: true,
          },
        ];
      });

      // Auto-mark as read if received
      if (msg.sender.id !== currentUserId && currentChatId) {
        axios
          .patch(
            `${API_BASE}/api/chats/me/${currentChatId}/read`,
            { messageIds: [msg.messageId] },
            { withCredentials: true },
          )
          .catch(() => {});
      }
    };

    socket.on('new_message', handleNewMessage);
    return () => socket.off('new_message', handleNewMessage);
  }, [currentChatId, isNewChat, currentUserId]);

  // === SEND TEXT MESSAGE (via WebSocket) ===
  const sendMessage = () => {
    if (!input.trim()) return;

    const payload = { text: input };
    if (isNewChat) {
      payload.receiverId = receiverId;
    } else {
      payload.chatId = currentChatId;
    }

    socket.emit('send_message', payload);
    setInput('');
  };

  // === SEND IMAGE ===
  const sendImage = async (file) => {
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await axios.post(
        `${API_BASE}/api/chats/me/${currentChatId || receiverId}/upload`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          withCredentials: true,
        },
      );

      const msg = res.data.data;
      setMessages((prev) => [
        ...prev,
        {
          messageId: msg.messageId,
          text: null,
          senderId: currentUserId,
          createdAt: msg.createdAt,
          imageUrl: msg.imageUrl,
          isRead: true,
        },
      ]);
    } catch (err) {
      console.error('Image upload failed:', err);
      alert('Failed to send image. Max 5MB, PNG/JPEG/WEBP only.');
    }
  };

  // === HANDLE NEW CHAT CREATION ===
  useEffect(() => {
    if (isNewChat && messages.length > 0) {
      const firstMsg = messages[0];
      if (firstMsg.chatId) {
        setCurrentChatId(firstMsg.chatId);
        navigate(`/supplier/chats/${firstMsg.chatId}`, { replace: true });
      }
    }
  }, [messages, isNewChat, navigate]);

  if (loading || !currentUserId)
    return <div className="chat-loading">{t('loading')}</div>;

  return (
    <div className="chat-detail">
      {/* === HEADER === */}
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
              <p>
                Business Activity:
                {partner?.categories?.map((c) => (
                  <span key={c.id} style={{ marginRight: '8px' }}>
                    {c.name}
                  </span>
                ))}
              </p>
            </div>
          </div>
        </div>

        <div
          className="chat-header-right"
          onClick={() => alert('Create Invoice')}
        >
          <div className="invoice-icon">
            <FaFileInvoiceDollar />
          </div>
          <div className="invoice-label">Create an Invoice</div>
        </div>
      </div>

      {/* === MESSAGES === */}
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

      {/* === INPUT === */}
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
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            style={{ display: 'none' }}
            onChange={(e) => {
              const file = e.target.files[0];
              if (file && file.size > 5 * 1024 * 1024) {
                alert('File too large. Max 5MB.');
                return;
              }
              if (isNewChat) {
                alert('Send a text message first to create the chat.');
              } else {
                sendImage(file);
              }
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
