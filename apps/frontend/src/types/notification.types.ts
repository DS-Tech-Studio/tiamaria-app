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