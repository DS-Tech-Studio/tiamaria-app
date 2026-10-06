export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number | string;
  is_available: boolean;
  is_active: boolean;
  stock_quantity: number;
  min_stock_alert: number;
}
