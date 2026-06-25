export type MenuProduct = {
  id: number;
  name: string;
  description: string;
  image_url: string | null;
  price: number;
  stock: number;
  is_available: boolean;
};

export type MenuCategory = {
  id: number;
  name: string;
  products: MenuProduct[];
};

export type BranchMenu = {
  branch_id: number;
  branch_name: string;
  address_text: string;
  country_code: string;
  is_active: boolean;
  opens_at: string;
  closes_at: string;
  accept_orders: boolean;
  is_open: boolean;
  currency: string;
  delivery_fee: number;
  restaurant_name: string;
  logo_url: string | null;
  status_restaurant: string;
  menu: MenuCategory[];
};
