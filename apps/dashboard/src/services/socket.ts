import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    const token = localStorage.getItem('token');
    socket = io('http://localhost:5000', {
      auth: { token },
      autoConnect: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000
    });

    socket.on('connect', () => {
      console.log('⚡ Connected to CyberShield Live Socket Engine');
    });

    socket.on('disconnect', () => {
      console.log('⚠️ Disconnected from CyberShield Live Socket Engine');
    });
  }
  return socket;
}

export function refreshSocketAuth() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
  return getSocket();
}
