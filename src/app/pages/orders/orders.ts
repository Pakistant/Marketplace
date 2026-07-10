import { isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { Order } from '../../models/producer';
import { OrdersService } from '../../services/orders.service';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './orders.html',
  styleUrl: './orders.css',
})
export class OrdersPage implements OnInit, OnDestroy {
  orders: Order[] = [];
  statusOptions: Array<Order['status']> = ['pending', 'confirmed', 'shipped'];
  isLoading = false;
  errorMessage = '';
  private subscriptions = new Subscription();

  constructor(
    private readonly ordersService: OrdersService,
    @Inject(PLATFORM_ID) private readonly platformId: object,
  ) {
    if (isPlatformBrowser(this.platformId)) {
      this.orders = this.ordersService.getCachedOrders();
      this.isLoading = this.orders.length === 0;
    }
  }

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.subscriptions.add(
      this.ordersService.orders$.subscribe((orders) => {
        this.orders = orders;
      }),
    );

    this.subscriptions.add(
      this.ordersService.loading$.subscribe((loading) => {
        this.isLoading = loading;
      }),
    );

    void this.refreshOrders(true);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  async refreshOrders(force = false): Promise<void> {
    this.errorMessage = '';

    try {
      await this.ordersService.listOrders(force);
    } catch (error) {
      if (this.orders.length === 0) {
        this.errorMessage = error instanceof Error ? error.message : 'Impossible de charger les commandes.';
      }
    }
  }

  async updateStatus(order: Order, event: Event): Promise<void> {
    const target = event.target as HTMLSelectElement;
    const previousStatus = order.status;
    const nextStatus = target.value as Order['status'];
    this.errorMessage = '';

    order.status = nextStatus;

    try {
      await this.ordersService.updateStatus(order.id, nextStatus);
    } catch (error) {
      order.status = previousStatus;
      target.value = previousStatus;
      this.errorMessage = error instanceof Error ? error.message : 'Impossible de mettre à jour le statut.';
    }
  }

  getStatusLabel(status: Order['status']): string {
    switch (status) {
      case 'confirmed':
        return 'Confirmée';
      case 'shipped':
        return 'Expédiée';
      default:
        return 'En attente';
    }
  }

  getStatusClass(status: Order['status']): string {
    switch (status) {
      case 'confirmed':
        return 'bg-info-subtle text-info-emphasis';
      case 'shipped':
        return 'bg-success-subtle text-success-emphasis';
      default:
        return 'bg-warning-subtle text-warning-emphasis';
    }
  }
}
