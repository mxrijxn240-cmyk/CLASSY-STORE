export type Category = 'Frame' | 'Car Frame' | 'Diecast Car';

export type Product = {
  id: string;
  name: string;
  price: number;
  category: Category;
  description: string;
  brand: string;
  scale: string;
  image_url: string;
  gallery_urls: string[];
  stock_quantity: number;
  is_available: boolean;
  is_featured: boolean;
  is_new: boolean;
  created_at?: string;
};

export type CartLine = { product: Product; quantity: number };

export type Order = {
  id: string;
  order_number: string;
  customer_name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pin_code: string;
  notes: string;
  total: number;
  payment_status: string;
  order_status: string;
  created_at: string;
  lines?: CartLine[];
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_name: string;
  image_url: string;
  quantity: number;
  unit_price: number;
};

export const orderStatuses = ['pending', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled'] as const;

export const money = (value: number) => `₹${value.toLocaleString('en-IN')}`;
