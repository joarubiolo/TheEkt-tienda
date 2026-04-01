export interface CartItem {
  id: number;
  productId: number;
  name: string;
  price: number;
  purchasePrice?: number;
  image: string;
  size: string;
  color: string;
  quantity: number;
}
