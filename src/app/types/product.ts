export interface Review {
  rating: number;
  comment: string;
  user: string;
  date: string;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  purchasePrice?: number;
  image: string;
  images?: string[];
  category: string;
  gender: string;
  type: string;
  sizes: string[];
  colors: string[];
  inStock: boolean;
  reviews?: Review[];
}