export interface Category {
  id: number;
  name: string;
}

export interface Supplier {
  id: number;
  name: string;
  email: string;
  registration_code: string;
  items: string;
  address?: string;
  phone?: string;
  category_id: number;
  category_name?: string;
}
