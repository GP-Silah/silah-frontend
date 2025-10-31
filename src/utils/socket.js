import { io } from 'socket.io-client';

const API_BASE = import.meta.env.VITE_BACKEND_URL || 'https://api.silah.site';

export const socket = io(API_BASE, {
  withCredentials: true,
  autoConnect: true,
  transports: ['websocket'],
});

// === CONNECT & JOIN USER ROOM ===
socket.on('connect', () => {
  console.log('SOCKET CONNECTED');
  socket.emit('join_user');
});

// === USER ROOM CONFIRMATION (GLOBAL, PERSISTENT) ===
socket.on('joined_user_room', (userId) => {
  console.log('Joined user room:', userId);
});

// === ERROR HANDLING ===
socket.on('connect_error', (err) => {
  console.error('SOCKET ERROR:', err.message);
});
