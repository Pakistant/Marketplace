import { isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Product } from '../../models/producer';
import { ProductsService } from '../../services/products.service';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './products.html',
  styleUrl: './products.css',
})
export class ProductsPage implements OnInit {
  products: Product[] = [];
  editingProductId: number | null = null;
  form: Omit<Product, 'id' | 'producerId' | 'createdAt'> = {
    name: '',
    description: '',
    price: 0,
    stock: 0,
    category: '',
  };
  isSubmitting = false;
  isLoading = false;
  errorMessage = '';

  constructor(
    private readonly productsService: ProductsService,
    @Inject(PLATFORM_ID) private readonly platformId: object,
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      void this.loadProducts();
    }
  }

  async onSubmit(): Promise<void> {
    this.isSubmitting = true;
    this.errorMessage = '';

    try {
      if (this.editingProductId) {
        const existing = this.products.find((product) => product.id === this.editingProductId);
        if (!existing) {
          throw new Error('Produit introuvable.');
        }

        await this.productsService.updateProduct({
          ...existing,
          ...this.form,
        });
      } else {
        await this.productsService.createProduct(this.form);
      }

      this.resetForm();
      await this.loadProducts();
    } catch (error) {
      this.errorMessage = error instanceof Error ? error.message : 'Impossible de sauvegarder le produit.';
    } finally {
      this.isSubmitting = false;
    }
  }

  editProduct(product: Product): void {
    this.editingProductId = product.id;
    this.form = {
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      category: product.category,
    };
  }

  cancelEdit(): void {
    this.resetForm();
  }

  async deleteProduct(productId: number): Promise<void> {
    if (!confirm('Supprimer ce produit ?')) {
      return;
    }

    this.errorMessage = '';

    try {
      await this.productsService.deleteProduct(productId);
      await this.loadProducts();
      if (this.editingProductId === productId) {
        this.resetForm();
      }
    } catch (error) {
      this.errorMessage = error instanceof Error ? error.message : 'Impossible de supprimer le produit.';
    }
  }

  private async loadProducts(): Promise<void> {
    this.isLoading = true;
    this.errorMessage = '';

    try {
      this.products = await this.productsService.listProducts();
    } catch (error) {
      this.products = [];
      this.errorMessage = error instanceof Error ? error.message : 'Impossible de charger les produits.';
    } finally {
      this.isLoading = false;
    }
  }

  private resetForm(): void {
    this.editingProductId = null;
    this.form = {
      name: '',
      description: '',
      price: 0,
      stock: 0,
      category: '',
    };
  }
}
