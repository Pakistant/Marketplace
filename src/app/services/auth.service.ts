import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Producer } from '../models/producer';

interface ApiUser {
  id: number;
  name: string;
  email: string;
  city?: string;
  role?: string;
}

interface StoredSession {
  producer: Producer;
  token: string | null;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly storageKey = 'producer-session';
  private readonly currentProducerSubject = new BehaviorSubject<Producer | null>(this.readStoredProducer());
  private token: string | null = this.readStoredToken();

  readonly currentProducer$ = this.currentProducerSubject.asObservable();

  constructor() {
    if (this.currentProducerSubject.value && !this.token) {
      this.logout();
    }
  }

  async login(email: string, password: string): Promise<Producer> {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const payload = await response.json();
        const producer = this.mapUserToProducer(payload.user as ApiUser);
        this.setSession(producer, payload.token as string);
        return producer;
      }

      if (response.status === 401) {
        throw new Error('Identifiants invalides.');
      }
    } catch (error) {
      if (error instanceof Error && error.message === 'Identifiants invalides.') {
        throw error;
      }
    }

    throw new Error('Impossible de se connecter. Vérifiez que le serveur est démarré.');
  }

  logout(): void {
    const storage = this.getStorage();
    storage?.removeItem(this.storageKey);
    this.token = null;
    this.currentProducerSubject.next(null);
  }

  isAuthenticated(): boolean {
    return this.currentProducerSubject.value !== null && this.token !== null;
  }

  getCurrentProducer(): Producer | null {
    return this.currentProducerSubject.value;
  }

  getToken(): string | null {
    return this.token;
  }

  private setSession(producer: Producer, token: string | null): void {
    const storage = this.getStorage();
    const session: StoredSession = { producer, token };
    storage?.setItem(this.storageKey, JSON.stringify(session));
    this.token = token;
    this.currentProducerSubject.next(producer);
  }

  private mapUserToProducer(user: ApiUser): Producer {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      businessName: user.name,
    };
  }

  private readStoredProducer(): Producer | null {
    return this.readStoredSession()?.producer ?? null;
  }

  private readStoredToken(): string | null {
    return this.readStoredSession()?.token ?? null;
  }

  private readStoredSession(): StoredSession | null {
    const storage = this.getStorage();
    const stored = storage?.getItem(this.storageKey);
    if (!stored) {
      return null;
    }

    try {
      const parsed = JSON.parse(stored) as StoredSession | Producer;
      if ('producer' in parsed) {
        return parsed;
      }

      return { producer: parsed, token: null };
    } catch {
      return null;
    }
  }

  private getStorage(): Storage | null {
    if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
      return null;
    }

    return window.localStorage;
  }
}
