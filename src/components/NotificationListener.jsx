import { useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNotifications } from '@/hooks/useNotifications';
import { useToast } from '@/context/NotificationPopupToast/NotificationContext';

export default function NotificationListener() {
  const { i18n } = useTranslation();
  const { addToast } = useToast();

  // Memoize the callback so it's stable across renders
  const handleNewNotification = useCallback(
    (newNotif) => {
      addToast(newNotif);
    },
    [addToast],
  ); // Only recreate if addToast changes (which it doesn't)

  // Pass stable callback + language
  useNotifications(i18n.language, handleNewNotification);

  return null;
}
