import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { io } from 'socket.io-client';
import type { NotificationItem } from '../types/notification.types';

interface NotificationContextProps {
  notifications: NotificationItem[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

interface OrderNotificationData {
  message?: string;
  code?: string;
  client?: { name?: string };
  items?: Array<{ product?: { name?: string } }>;
  order?: OrderNotificationData;
}

// 1. Declaración del Contexto
const NotificationContext = createContext<NotificationContextProps | undefined>(undefined);

// 2. Limpieza de URL para remover '/api/v1' si viene en las variables de entorno
const rawUrl = import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_URL || 'http://localhost:3000';
const SOCKET_URL = rawUrl.replace(/\/api\/v1\/?$/, '');

function createOrderNotification(payload: OrderNotificationData): NotificationItem {
  const order = payload.order ?? payload;
  const productName = order.items?.[0]?.product?.name || 'Varios productos';

  return {
    id: crypto.randomUUID(),
    title: 'Nuevo pedido',
    message: `Pedido ${order.code || 'sin código'} - ${productName}`,
    clientName: order.client?.name || 'Cliente sin nombre',
    orderCode: order.code,
    type: 'NEW_ORDER',
    isRead: false,
    createdAt: new Date(),
  };
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    const socket = io(SOCKET_URL, {
      transports: ['polling', 'websocket'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
      console.log('✅ Conectado a WebSockets con ID:', socket.id);
    });

    socket.on('connect_error', (error) => {
      console.error('❌ Error de conexión en Socket.io:', error.message);
    });

    const handleOrderCreated = (payload: OrderNotificationData) => {
      console.log('🔔 Evento de pedido recibido:', payload);
      setNotifications((current) => [createOrderNotification(payload), ...current]);
    };

    socket.on('order:created', handleOrderCreated);
    socket.on('order_created', handleOrderCreated);

    return () => {
      socket.off('connect');
      socket.off('connect_error');
      socket.off('order:created', handleOrderCreated);
      socket.off('order_created', handleOrderCreated);
      socket.disconnect();
    };
  }, []);

  const unreadCount = notifications.filter((notification) => !notification.isRead).length;

  const markAsRead = (id: string) => {
    setNotifications((current) =>
      current.map((notification) =>
        notification.id === id ? { ...notification, isRead: true } : notification,
      ),
    );
  };

  const markAllAsRead = () => {
    setNotifications((current) => current.map((notification) => ({ ...notification, isRead: true })));
  };

  const removeNotification = (id: string) => {
    setNotifications((current) => current.filter((notification) => notification.id !== id));
  };

  const clearAll = () => setNotifications([]);

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, markAsRead, markAllAsRead, removeNotification, clearAll }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useNotifications() {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error('useNotifications debe usarse dentro de un NotificationProvider');
  }

  return context;
}