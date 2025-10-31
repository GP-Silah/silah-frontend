import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNotifications } from '@/hooks/useNotifications';
import { useToast } from '@/context/NotificationPopupToast/NotificationContext';

export default function NotificationListener() {
  const { i18n } = useTranslation();
  const { addToast } = useToast();

  // Pass the callback – it will be called for every **new** SSE notification
  useNotifications(i18n.language, (newNotif) => {
    addToast(newNotif);
  });

  // This component renders nothing
  return null;
}
