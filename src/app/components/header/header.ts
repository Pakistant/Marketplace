import { Component, OnInit } from '@angular/core';
import { NgIf } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Producer } from '../../models/producer';
import { AuthService } from '../../services/auth.service';
import { OrdersService } from '../../services/orders.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [NgIf, RouterLink, RouterLinkActive],
  templateUrl: './header.html',
})
export class Header implements OnInit {
  producer: Producer | null = null;

  constructor(
    private readonly authService: AuthService,
    private readonly ordersService: OrdersService,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    this.authService.currentProducer$.subscribe((producer) => {
      this.producer = producer;
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  prefetchOrders(): void {
    this.ordersService.preloadOrders();
  }
}
