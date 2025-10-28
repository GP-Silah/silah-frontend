import { useEffect, useState, useRef } from 'react';
import axios from 'axios';

export const useNotifications = (lang) => {
  const [notifications, setNotifications] = useState([]);
  const [profilePics, setProfilePics] = useState({});
  const eventSourceRef = useRef(null);

  useEffect(() => {
    // Initial fetch
    const fetchInitial = async () => {
      try {
        const { data } = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/notifications/me`,
          { params: { lang }, withCredentials: true },
        );
        setNotifications(data);
      } catch (err) {
        console.error('Failed to load notifications', err);
      }
    };

    fetchInitial();

    // SSE
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

        // Avoid duplicates
        setNotifications((prev) =>
          prev.some((n) => n.notificationId === notif.notificationId)
            ? prev
            : [notif, ...prev],
        );

        // Fetch profile pic
        const senderId = notif.sender.userId;
        if (!profilePics[senderId]) {
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
      console.error('SSE error');
      es.close();
    };

    return () => {
      es.close();
      eventSourceRef.current = null;
    };
  }, [lang]);

  const markAsRead = async (ids) => {
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

  return { notifications, profilePics, markAsRead };
};
