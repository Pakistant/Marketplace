import { Routes } from '@angular/router';
import { authGuard } from './auth.guard';
import { LoginPage } from './pages/login/login';
import { ProductsPage } from './pages/products/products';
import { OrdersPage } from './pages/orders/orders';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginPage },
  { path: 'products', component: ProductsPage, canActivate: [authGuard] },
  { path: 'orders', component: OrdersPage, canActivate: [authGuard] },
  { path: '**', redirectTo: 'login' },
];
