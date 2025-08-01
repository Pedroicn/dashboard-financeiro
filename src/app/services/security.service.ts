import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SecurityService {

  constructor() {
    this.validateEnvironment();
  }

  private validateEnvironment(): void {
    // Validações de segurança em desenvolvimento
    if (!environment.production) {
      console.warn('🔥 Modo de desenvolvimento ativo');
      
      // Verificar se configurações estão corretas
      if (!environment.firebase.apiKey || environment.firebase.apiKey === 'YOUR_API_KEY') {
        console.error('❌ Firebase API Key não configurada corretamente');
      }
      
      if (!environment.firebase.projectId) {
        console.error('❌ Firebase Project ID não configurado');
      }
    }
  }

  /**
   * Verifica se o usuário está autenticado antes de operações sensíveis
   */
  isUserAuthenticated(): boolean {
    // Implementar validação de autenticação
    return true; // Placeholder
  }

  /**
   * Sanitiza dados antes de enviar para o Firestore
   */
  sanitizeData(data: any): any {
    // Remove campos sensíveis ou desnecessários
    const sanitized = { ...data };
    delete sanitized.password;
    delete sanitized.privateKey;
    return sanitized;
  }

  /**
   * Valida domínios permitidos para operações
   */
  isValidDomain(): boolean {
    const allowedDomains = [
      'localhost',
      'dashboard-financeiro-5dc0e.web.app',
      'dashboard-financeiro-5dc0e.firebaseapp.com'
    ];
    
    return allowedDomains.some(domain => 
      window.location.hostname.includes(domain)
    );
  }

  /**
   * Log de segurança para auditoria
   */
  logSecurityEvent(event: string, details?: any): void {
    if (environment.enableDebug) {
      console.log(`🔐 Security Event: ${event}`, details);
    }
  }
}
