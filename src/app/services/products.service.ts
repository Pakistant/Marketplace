import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AuthService } from './auth.service';
import { Product } from '../models/producer';

interface ApiProduct {
  id: number;
  producer_id: number;
  name: string;
  description: string;
  price: number;
  quantity: number;
  category: string;
  created_at: string;
}

@Injectable({ providedIn: 'root' })
export class ProductsService {
  constructor(
    private readonly http: HttpClient,
    private readonly authService: AuthService,
  ) {}

  async listProducts(): Promise<Product[]> {
    const token = this.authService.getToken();
    if (!token) {
      return [];
    }

    const rows = await firstValueFrom(
      this.http.get<ApiProduct[]>('/api/products/mine', { headers: this.authHeaders() }),
    );
    return rows.map((row) => this.mapProduct(row));
  }

  async createProduct(payload: Omit<Product, 'id' | 'producerId' | 'createdAt'>): Promise<Product> {
    const created = await firstValueFrom(
      this.http.post<ApiProduct>(
        '/api/products',
        {
          name: payload.name,
          description: payload.description,
          price: payload.price,
          quantity: payload.stock,
          category: payload.category,
        },
        { headers: this.authHeaders() },
      ),
    );
    return this.mapProduct(created);
  }

  async updateProduct(product: Product): Promise<Product> {
    const updated = await firstValueFrom(
      this.http.put<ApiProduct>(
        `/api/products/${product.id}`,
        {
          name: product.name,
          description: product.description,
          price: product.price,
          quantity: product.stock,
          category: product.category,
        },
        { headers: this.authHeaders() },
      ),
    );
    return this.mapProduct(updated);
  }

  async deleteProduct(productId: number): Promise<void> {
    await firstValueFrom(
      this.http.delete(`/api/products/${productId}`, { headers: this.authHeaders() }),
    );
  }

  private authHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders(token ? { Authorization: `Bearer ${token}` } : {});
  }

  private mapProduct(row: ApiProduct): Product {
    return {
      id: row.id,
      producerId: row.producer_id,
      name: row.name,
      description: row.description,
      price: row.price,
      stock: row.quantity,
      category: row.category,
      createdAt: row.created_at,
    };
  }
}
