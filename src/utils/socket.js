import { io } from 'socket.io-client';
import { API_BASE } from '../config';

export const socket = io(API_BASE, {
  autoConnect: false,
});

export const connectSocket = (token) => {
  socket.auth = { token };
  socket.connect();
};

export const disconnectSocket = () => {
  socket.disconnect();
};
