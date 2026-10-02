export type OrderStatus = 'PENDIENTE' | 'EN_PREPARACION' | 'ENTREGADO' | 'CANCELADO';
export type PaymentMethod = 'EFECTIVO' | 'TRANSFERENCIA';

export const ORDER_DISCOUNT_PERCENTAGES = [5, 10, 15, 20, 25] as const;

export interface ProductOption {
  id: string;
  name: string;
  price: number | string;
  stock_quantity: number;
  is_active: boolean;
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
  discount_amount: number | string;
  discount_percent: number;
  payment_method: PaymentMethod;
  receipt_image_url?: string | null;
  notes?: string | null;
  created_at: string;
  items: OrderItem[];
}

export interface CreateOrderPayload {
  client_id: string;
  notes?: string;
  payment_method: PaymentMethod;
  receipt_image_url?: string;
  discount_percent: number;
  items: Array<{ product_id: string; quantity: number }>;
}

export type UpdateOrderPayload = Omit<
  CreateOrderPayload,
  'payment_method' | 'discount_percent'
> & Partial<
  Pick<CreateOrderPayload, 'payment_method' | 'receipt_image_url' | 'discount_percent'>
>;

export const ORDER_STATUS_OPTIONS: Array<{ label: string; value: OrderStatus | '' }> = [
  { label: 'Todos los estados', value: '' },
  { label: 'Pendiente', value: 'PENDIENTE' },
  { label: 'En preparación', value: 'EN_PREPARACION' },
  { label: 'Entregado', value: 'ENTREGADO' },
  { label: 'Cancelado', value: 'CANCELADO' },
];

export function formatCurrency(value: number | string): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);
}