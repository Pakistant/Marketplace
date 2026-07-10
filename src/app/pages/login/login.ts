import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class LoginPage {
  email = 'ouest@marketdouala.cm';
  password = 'password123';
  errorMessage = '';
  isSubmitting = false;

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
  ) {}

  async onSubmit(): Promise<void> {
    this.errorMessage = '';
    this.isSubmitting = true;

    try {
      await this.authService.login(this.email, this.password);
      this.router.navigate(['/products']);
    } catch (error) {
      this.errorMessage = error instanceof Error ? error.message : 'Connexion impossible.';
    } finally {
      this.isSubmitting = false;
    }
  }
}
