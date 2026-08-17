import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
const WS_URL = SOCKET_URL.replace(/^http/, 'ws');

export function SocketProvider({ children }) {
  const { token, user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [latestEvent, setLatestEvent] = useState(null);
  const wsRef = useRef(null);

  useEffect(() => {
    let ws = null;
    let reconnectTimeout = null;

    function connect() {
      try {
        const query = token ? `?token=${encodeURIComponent(token)}` : '';
        ws = new WebSocket(`${WS_URL}${query}`);

        ws.onopen = () => {
          console.log('[WebSocket Client] Connected to real-time server at', WS_URL);
          setIsConnected(true);
        };

        ws.onmessage = (e) => {
          try {
            const parsed = JSON.parse(e.data);
            const { event, data } = parsed;

            if (event === 'notification:new_booking' || event === 'notification:appointment_status' || event === 'notification:new_medical_record') {
              const newNotification = {
                id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                title: data?.title || 'Clinical Alert',
                message: data?.message || 'New update in patient queue',
                timestamp: new Date(),
                read: false,
                ...data
              };
              setNotifications((prev) => [newNotification, ...prev]);
              setLatestEvent(newNotification);
            } else if (event === 'appointment:created' || event === 'appointment:updated') {
              setLatestEvent({ type: event, data, timestamp: new Date() });
            }
          } catch (err) {
            // Non-JSON message
          }
        };

        ws.onclose = () => {
          console.log('[WebSocket Client] Disconnected. Reconnecting in 3s...');
          setIsConnected(false);
          reconnectTimeout = setTimeout(connect, 3000);
        };

        ws.onerror = () => {
          setIsConnected(false);
        };

        wsRef.current = ws;
      } catch (err) {
        console.warn('[WebSocket Client] Connection error:', err.message);
      }
    }

    connect();

    return () => {
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (ws) ws.close();
    };
  }, [token, user?.id]);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const markAsRead = useCallback((id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const emit = useCallback((event, data) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ event, data }));
    }
  }, []);

  // Socket helper facade
  const socketFacade = {
    emit,
    on: (event, callback) => {
      // Event listeners handled in SocketContext
    },
    off: () => {}
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const value = {
    socket: socketFacade,
    isConnected,
    notifications,
    unreadCount,
    latestEvent,
    clearNotifications,
    markAsRead
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}

export default SocketContext;
