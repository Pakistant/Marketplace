import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { AuthService } from './auth.service';
import { Order } from '../models/producer';

interface ApiOrderRow {
  id: number;
  customer_name: string;
  customer_phone: string;
  status: Order['status'];
  created_at: string;
  quantity: number;
  unit_price: number;
  product_name: string;
}

@Injectable({ providedIn: 'root' })
export class OrdersService {
  private readonly ordersSubject = new BehaviorSubject<Order[]>([]);
  private readonly loadingSubject = new BehaviorSubject(false);
  private fetchPromise: Promise<Order[]> | null = null;

  readonly orders$ = this.ordersSubject.asObservable();
  readonly loading$ = this.loadingSubject.asObservable();

  constructor(
    private readonly http: HttpClient,
    private readonly authService: AuthService,
  ) {
    this.authService.currentProducer$.subscribe((producer) => {
      if (!producer) {
        this.clearCache();
      }
    });
  }

  getCachedOrders(): Order[] {
    return this.ordersSubject.value;
  }

  isLoading(): boolean {
    return this.loadingSubject.value;
  }

  preloadOrders(): void {
    if (this.authService.getToken()) {
      void this.listOrders({ silent: true });
    }
  }

  async listOrders(options: { force?: boolean; silent?: boolean } = {}): Promise<Order[]> {
    const token = this.authService.getToken();
    if (!token) {
      throw new Error('Session expirée. Reconnectez-vous pour voir vos commandes.');
    }

    if (!options.force && this.ordersSubject.value.length > 0) {
      return this.ordersSubject.value;
    }

    if (this.fetchPromise) {
      return this.fetchPromise;
    }

    if (!options.silent) {
      this.loadingSubject.next(true);
    }

    this.fetchPromise = this.fetchOrdersFromApi();

    try {
      const orders = await this.fetchPromise;
      this.ordersSubject.next(orders);
      return orders;
    } finally {
      this.fetchPromise = null;
      this.loadingSubject.next(false);
    }
  }

  async updateStatus(orderId: number, status: Order['status']): Promise<void> {
    await firstValueFrom(
      this.http.patch(`/api/orders/${orderId}/status`, { status }, { headers: this.authHeaders() }),
    );

    const updated = this.ordersSubject.value.map((order) =>
      order.id === orderId ? { ...order, status } : order,
    );
    this.ordersSubject.next(updated);
  }

  private async fetchOrdersFromApi(): Promise<Order[]> {
    const rows = await firstValueFrom(
      this.http.get<ApiOrderRow[]>('/api/orders', { headers: this.authHeaders() }),
    );

    return rows.map((row) => ({
      id: row.id,
      producerId: this.authService.getCurrentProducer()?.id ?? 0,
      productId: 0,
      productName: row.product_name,
      customer: row.customer_name,
      quantity: row.quantity,
      status: row.status,
      createdAt: row.created_at,
    }));
  }

  private clearCache(): void {
    this.ordersSubject.next([]);
    this.fetchPromise = null;
    this.loadingSubject.next(false);
  }

  private authHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders(token ? { Authorization: `Bearer ${token}` } : {});
  }
}
