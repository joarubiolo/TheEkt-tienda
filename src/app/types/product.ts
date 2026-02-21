export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  gender: string;
  type: string;
  sizes: string[];
  colors: string[];
  inStock: boolean;
}