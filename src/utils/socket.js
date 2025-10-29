import { io } from 'socket.io-client';

const API_BASE = import.meta.env.VITE_BACKEND_URL || 'https://api.silah.site';

export const socket = io(API_BASE, {
  withCredentials: true,
  autoConnect: true,
});

socket.on('connect', () => {
  socket.emit('join_user');
});

// Debug
socket.on('connect_error', (err) => {
  console.error('Socket connect error:', err.message);
});
