export interface Client {
  id: string;
  contact_name: string;
  business_name?: string;
  phone: string;
  address: string;
  notes?: string;
}