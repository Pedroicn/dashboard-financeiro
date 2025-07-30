import { Injectable } from '@angular/core';

// @Injectable({
//   providedIn: 'root'
// })
export class CleanupService {

  constructor() {
    console.log('🚨 CleanupService constructor chamado!', new Error().stack);
    // this.clearAllLegacyData(); // DESABILITADO
  }

  /**
   * Remove todos os dados antigos do localStorage que possam interferir
   * com a nova implementação que usa apenas Firestore
   */
  private clearAllLegacyData(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      console.log('CleanupService: Iniciando limpeza de dados legados...');
      
      // Lista de todas as chaves conhecidas que devem ser removidas
      const legacyKeys = [
        'financial-dashboard-expenses',
        'financial-dashboard-goals',
        'financial-dashboard-suggestions',
        'financial-dashboard-user',
        'expenses',
        'goals', 
        'suggestions',
        'ai-suggestions',
        'user-preferences',
        'dashboard-data',
        'expense-categories',
        'goal-progress'
      ];

      // Remove chaves específicas
      legacyKeys.forEach(key => {
        if (localStorage.getItem(key)) {
          localStorage.removeItem(key);
          console.log('CleanupService: Removida chave legada:', key);
        }
      });

      // Remove qualquer chave que contenha termos relacionados ao dashboard
      const allKeys = Object.keys(localStorage);
      const relatedKeys = allKeys.filter(key => 
        key.includes('financial') ||
        key.includes('dashboard') ||
        key.includes('expense') ||
        key.includes('goal') ||
        key.includes('suggestion') ||
        key.includes('ai-')
      );

      relatedKeys.forEach(key => {
        localStorage.removeItem(key);
        console.log('CleanupService: Removida chave relacionada:', key);
      });

      if (legacyKeys.length > 0 || relatedKeys.length > 0) {
        console.log('CleanupService: Limpeza concluída. Dados legados removidos.');
      } else {
        console.log('CleanupService: Nenhum dado legado encontrado.');
      }
    }
  }

  /**
   * Método público para forçar limpeza manual se necessário
   */
  public forceClearAll(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.clear();
      console.log('CleanupService: localStorage completamente limpo.');
    }
  }
}
