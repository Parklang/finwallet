'use client';

import { useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/store/auth.store';
import toast from 'react-hot-toast';

/**
 * Interface for notification data received from the backend
 */
interface ServerNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  data?: any;
  createdAt: string;
}

export const useSocket = (): Socket | null => {
  const accessToken = useAuthStore((state) => state.accessToken);
  const user = useAuthStore((state) => state.user);
  const [socket, setSocket] = useState<Socket | null>(null);

  const handleNotification = useCallback((data: ServerNotification) => {
    console.log('[Socket] Notification received:', data);

    // Standardize message display
    const displayMessage = data.message || data.title || 'Bạn có thông báo mới';

    toast(displayMessage, {
      icon: data.type === 'ALERT' ? '⚠️' : '🔔',
      style: {
        borderRadius: '12px',
        background: 'var(--color-bg-card, #fff)',
        color: 'var(--color-text-primary, #000)',
        border: '1px solid var(--color-border)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        fontSize: '14px',
        fontWeight: 500
      },
    });
  }, []);

  useEffect(() => {
    // Return early if no auth data
    if (!accessToken || !user?.id) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    // Build WebSocket URL from environment variables
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
    const wsBaseUrl = process.env.NEXT_PUBLIC_WS_URL || apiUrl.split('/api')[0];

    // Connect to /notifications namespace
    const socketInstance = io(`${wsBaseUrl}/notifications`, {
      auth: {
        token: accessToken,
        userId: user.id
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      autoConnect: true
    });

    socketInstance.on('connect', () => {
      console.log('[Socket] Connected to /notifications namespace');
    });

    socketInstance.on('connect_error', (error) => {
      console.error('[Socket] Connection failure:', error.message);
    });

    socketInstance.on('notification', handleNotification);

    setSocket(socketInstance);

    return () => {
      console.log('[Socket] Cleaning up connection...');
      socketInstance.off('notification', handleNotification);
      socketInstance.disconnect();
    };
  }, [accessToken, user?.id, handleNotification]);

  return socket;
};
