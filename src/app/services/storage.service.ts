import { Injectable, Inject, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private authService = inject(AuthService);

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    console.log('🚨 StorageService constructor chamado!', new Error().stack);
  }

  private getUserKey(key: string): string {
    const userId = this.authService.getCurrentUserId();
    return userId ? `${userId}_${key}` : key;
  }

  getItem(key: string): string | null {
    console.error('🚨 StorageService.getItem chamado!', { key, stack: new Error().stack });
    return null; // BLOQUEADO
  }

  setItem(key: string, value: string): void {
    console.error('🚨 CRÍTICO: StorageService.setItem sendo chamado!', {
      key: key,
      value: value?.substring(0, 100) + '...',
      stackTrace: new Error().stack
    });
    // COMPLETAMENTE BLOQUEADO - NÃO FAZ NADA
    throw new Error('StorageService BLOQUEADO para debug');
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

  // Método para limpar dados antigos do sistema anterior
  clearOldData(): void {
    if (isPlatformBrowser(this.platformId)) {
      // Remove dados antigos que não eram isolados por usuário
      const oldKeys = [
        'financial-dashboard-expenses',
        'financial-dashboard-goals',
        'financial-dashboard-ai-suggestions'
      ];
      
      oldKeys.forEach(key => {
        localStorage.removeItem(key);
      });
      
      console.log('Dados antigos do localStorage removidos');
    }
  }
}
