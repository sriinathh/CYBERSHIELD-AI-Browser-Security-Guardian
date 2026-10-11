import { Server as SocketIOServer } from 'socket.io';
import http from 'http';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-development-key';

export class SocketService {
  private io: SocketIOServer | null = null;

  public init(server: http.Server) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: '*', // Allows dashboard and chrome extension
        methods: ['GET', 'POST']
      }
    });

    // Authentication middleware
    this.io.use((socket, next) => {
      const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];
      if (!token) {
        // Allow unauthenticated connection with limited anonymous room
        socket.data.userId = 'anonymous';
        return next();
      }

      try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        socket.data.userId = decoded.userId;
        next();
      } catch (err) {
        socket.data.userId = 'anonymous';
        next();
      }
    });

    this.io.on('connection', (socket) => {
      const userId = socket.data.userId;
      if (userId && userId !== 'anonymous') {
        socket.join(`user_${userId}`);
      }
      socket.join('public_alerts');

      socket.on('disconnect', () => {
        // Disconnected
      });
    });

    console.log('✅ Socket.IO Real-time Engine initialized');
  }

  public emitScanComplete(userId: string | undefined, analysis: any) {
    if (!this.io) return;
    if (userId) {
      this.io.to(`user_${userId}`).emit('SCAN_COMPLETED', analysis);
    }
    this.io.to('public_alerts').emit('SCAN_COMPLETED', analysis);
  }

  public emitSecurityEvent(userId: string | undefined, event: any) {
    if (!this.io) return;
    if (userId) {
      this.io.to(`user_${userId}`).emit('SECURITY_EVENT', event);
    }
    this.io.to('public_alerts').emit('SECURITY_EVENT', event);
  }

  public emitNotification(userId: string | undefined, notification: any) {
    if (!this.io) return;
    if (userId) {
      this.io.to(`user_${userId}`).emit('NEW_NOTIFICATION', notification);
    }
  }
}

export const socketService = new SocketService();
