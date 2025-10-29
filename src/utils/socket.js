import { io } from 'socket.io-client';

const API_BASE = import.meta.env.VITE_BACKEND_URL || 'https://api.silah.site';

export const socket = io(API_BASE, {
  withCredentials: true,
  transports: ['websocket'],
  autoConnect: false, // We'll connect manually in component
});

// Debug
socket.on('connect_error', (err) => {
  console.error('Socket connect error:', err.message);
});
