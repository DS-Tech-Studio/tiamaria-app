export type OrderStatus = 'PENDIENTE' | 'EN_PREPARACION' | 'ENTREGADO' | 'CANCELADO';

export interface ProductOption {
  id: string;
  name: string;
  price: number | string;
  is_available: boolean;
}

export interface OrderItem {
  id?: string;
  product_id: string;
  product: ProductOption;
  quantity: number;
  unit_price: number | string;
  subtotal: number | string;
}

export interface Order {
  id: string;
  code: string;
  client_id: string;
  client: {
    id: string;
    contact_name: string;
    business_name?: string;
  };
  seller?: {
    id: string;
    fullName?: string;
    email?: string;
  };
  status: OrderStatus;
  total_amount: number | string;
  notes?: string | null;
  created_at: string;
  items: OrderItem[];
}

export interface CreateOrderPayload {
  client_id: string;
  notes?: string;
  items: Array<{ product_id: string; quantity: number }>;
}

export const ORDER_STATUS_OPTIONS: Array<{ label: string; value: OrderStatus | '' }> = [
  { label: 'Todos los estados', value: '' },
  { label: 'Pendiente', value: 'PENDIENTE' },
  { label: 'En preparación', value: 'EN_PREPARACION' },
  { label: 'Entregado', value: 'ENTREGADO' },
  { label: 'Cancelado', value: 'CANCELADO' },
];

export function formatCurrency(value: number | string): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);
}