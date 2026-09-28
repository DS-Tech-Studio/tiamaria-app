export interface NotificationClient {
  name?: string;
  contact_name?: string;
  business_name?: string;
}

export interface SocketOrderNotificationPayload {
  message?: string;
  code?: string;
  client?: NotificationClient;
  items?: Array<{ product?: { name?: string } }>;
  order?: SocketOrderNotificationPayload;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  clientName?: string;
  orderCode?: string;
  type: 'NEW_ORDER' | 'ORDER_READY' | 'ORDER_CANCELLED' | 'GENERAL';
  isRead: boolean;
  createdAt: Date;
}