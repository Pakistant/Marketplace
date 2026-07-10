export interface Producer {
  id: number;
  name: string;
  email: string;
  businessName: string;
}

export interface Product {
  id: number;
  producerId: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  createdAt: string;
}

export interface Order {
  id: number;
  producerId: number;
  productId: number;
  productName: string;
  customer: string;
  quantity: number;
  status: 'pending' | 'confirmed' | 'shipped';
  createdAt: string;
}
