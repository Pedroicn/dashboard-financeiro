import { Component, inject } from '@angular/core';
import { Firestore, collection, doc, addDoc, getDocs, query, where } from '@angular/fire/firestore';
import { AuthService } from './services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-debug-firestore',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="padding: 20px; background: #f5f5f5; border: 1px solid #ddd; margin: 10px;">
      <h3>🔧 Debug Firestore</h3>
      <p>Usuário atual: <strong>{{ currentUserId || 'Não logado' }}</strong></p>
      
      <button (click)="testFirestoreWrite()" style="margin: 5px; padding: 10px;">
        Testar Escrita no Firestore
      </button>
      
      <button (click)="testFirestoreRead()" style="margin: 5px; padding: 10px;">
        Testar Leitura do Firestore
      </button>
      
      <button (click)="clearLogs()" style="margin: 5px; padding: 10px;">
        Limpar Logs
      </button>
      
      <div style="background: white; padding: 10px; margin-top: 10px; max-height: 400px; overflow-y: auto;">
        <pre>{{ logs }}</pre>
      </div>
    </div>
  `
})
export class DebugFirestoreComponent {
  private firestore = inject(Firestore);
  private authService = inject(AuthService);
  
  currentUserId: string | null = null;
  logs: string = '';

  constructor() {
    this.authService.user$.subscribe(user => {
      this.currentUserId = user?.uid || null;
      this.log(`👤 Usuário alterado: ${this.currentUserId}`);
    });
  }

  private log(message: string) {
    const timestamp = new Date().toLocaleTimeString();
    this.logs += `[${timestamp}] ${message}\n`;
    console.log(message);
  }

  async testFirestoreWrite() {
    try {
      this.log('🔄 Testando escrita no Firestore...');
      
      if (!this.currentUserId) {
        this.log('❌ Erro: Usuário não está logado');
        return;
      }

      const testData = {
        userId: this.currentUserId,
        amount: 10.50,
        description: 'Teste de escrita',
        category: 'Outros',
        date: new Date().toISOString(),
        type: 'expense',
        timestamp: Date.now()
      };

      const expensesRef = collection(this.firestore, 'expenses');
      const docRef = await addDoc(expensesRef, testData);
      
      this.log(`✅ Sucesso na escrita! Doc ID: ${docRef.id}`);
    } catch (error: any) {
      this.log(`❌ Erro na escrita: ${error.message}`);
      this.log(`❌ Código do erro: ${error.code}`);
      console.error('Erro completo:', error);
    }
  }

  async testFirestoreRead() {
    try {
      this.log('🔍 Testando leitura do Firestore...');
      
      if (!this.currentUserId) {
        this.log('❌ Erro: Usuário não está logado');
        return;
      }

      const expensesRef = collection(this.firestore, 'expenses');
      
      // Teste 1: Ler todos os documentos
      this.log('🔍 Teste 1: Lendo todos os documentos...');
      const allDocs = await getDocs(expensesRef);
      this.log(`📄 Total de documentos na coleção: ${allDocs.size}`);

      // Teste 2: Ler apenas documentos do usuário atual
      this.log('🔍 Teste 2: Lendo documentos do usuário atual...');
      const userQuery = query(expensesRef, where('userId', '==', this.currentUserId));
      const userDocs = await getDocs(userQuery);
      this.log(`📄 Documentos do usuário ${this.currentUserId}: ${userDocs.size}`);

      userDocs.forEach((doc) => {
        const data = doc.data();
        this.log(`📄 Doc ${doc.id}: ${data['description']} - R$ ${data['amount']}`);
      });

    } catch (error: any) {
      this.log(`❌ Erro na leitura: ${error.message}`);
      this.log(`❌ Código do erro: ${error.code}`);
      console.error('Erro completo:', error);
    }
  }

  clearLogs() {
    this.logs = '';
  }
}
