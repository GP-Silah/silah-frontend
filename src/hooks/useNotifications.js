import { useEffect, useState, useRef } from 'react';
import axios from 'axios';

export const useNotifications = (lang, onNewNotification) => {
  const [notifications, setNotifications] = useState([]);
  const [profilePics, setProfilePics] = useState({});
  const eventSourceRef = useRef(null);
  const seenIdsRef = useRef(new Set());

  useEffect(() => {
    const fetchInitial = async () => {
      try {
        const { data } = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/notifications/me`,
          { params: { lang }, withCredentials: true },
        );
        setNotifications(data);
        data.forEach((n) => seenIdsRef.current.add(n.notificationId));
      } catch (err) {
        console.error('Failed to load notifications', err);
      }
    };

    fetchInitial();

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const es = new EventSource(
      `${import.meta.env.VITE_BACKEND_URL}/api/notifications/stream`,
      { withCredentials: true },
    );
    eventSourceRef.current = es;

    es.onmessage = async (e) => {
      try {
        const parsed = JSON.parse(e.data);
        const notif = parsed.data ? JSON.parse(parsed.data) : parsed;

        if (seenIdsRef.current.has(notif.notificationId)) return;
        seenIdsRef.current.add(notif.notificationId);

        setNotifications((prev) => [notif, ...prev]);
        onNewNotification?.(notif);

        const senderId = notif.sender?.userId;
        if (senderId && !profilePics[senderId]) {
          try {
            const { data } = await axios.get(
              `${
                import.meta.env.VITE_BACKEND_URL
              }/api/users/${senderId}/profile-picture`,
              { withCredentials: true },
            );
            if (data.pfpUrl) {
              setProfilePics((prev) => ({ ...prev, [senderId]: data.pfpUrl }));
            }
          } catch (err) {
            console.error('Failed to fetch pfp', err);
          }
        }
      } catch (err) {
        console.error('SSE parse error', err);
      }
    };

    es.onerror = () => {
      console.error('SSE error – browser will retry');
    };

    return () => {
      es.close();
      eventSourceRef.current = null;
      seenIdsRef.current.clear();
    };
  }, [lang, onNewNotification]);

  const markAllAsRead = async (ids) => {
    try {
      await axios.patch(
        `${import.meta.env.VITE_BACKEND_URL}/api/notifications/read-many`,
        { notificationIds: ids },
        { withCredentials: true },
      );
      setNotifications((prev) =>
        prev.map((n) =>
          ids.includes(n.notificationId) ? { ...n, isRead: true } : n,
        ),
      );
    } catch (err) {
      console.error('Failed to mark read', err);
    }
  };

  const markSingleAsRead = async (notificationId) => {
    try {
      const { data } = await axios.patch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/notifications/${notificationId}/read`,
        {},
        { withCredentials: true },
      );
      setNotifications((prev) =>
        prev.map((n) => (n.notificationId === notificationId ? data : n)),
      );
    } catch (err) {
      console.error('Failed to mark single as read', err);
    }
  };

  return { notifications, profilePics, markAllAsRead, markSingleAsRead };
};
