import { Injectable, Inject, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private authService = inject(AuthService);

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  private getUserKey(key: string): string {
    const userId = this.authService.getCurrentUserId();
    return userId ? `${userId}_${key}` : key;
  }

  getItem(key: string): string | null {
    if (isPlatformBrowser(this.platformId)) {
      const userKey = this.getUserKey(key);
      return localStorage.getItem(userKey);
    }
    return null;
  }

  setItem(key: string, value: string): void {
    if (isPlatformBrowser(this.platformId)) {
      const userKey = this.getUserKey(key);
      localStorage.setItem(userKey, value);
    }
  }

  removeItem(key: string): void {
    if (isPlatformBrowser(this.platformId)) {
      const userKey = this.getUserKey(key);
      localStorage.removeItem(userKey);
    }
  }

  clear(): void {
    if (isPlatformBrowser(this.platformId)) {
      const userId = this.authService.getCurrentUserId();
      if (userId) {
        // Remove apenas os dados do usuário atual
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
          if (key.startsWith(`${userId}_`)) {
            localStorage.removeItem(key);
          }
        });
      } else {
        localStorage.clear();
      }
    }
  }

  // Método para limpar dados de um usuário específico ao fazer logout
  clearUserData(userId: string): void {
    if (isPlatformBrowser(this.platformId)) {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(`${userId}_`)) {
          localStorage.removeItem(key);
        }
      });
    }
  }
}
