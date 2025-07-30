import { Injectable } from '@angular/core';
import { Firestore, collection, query, where, getDocs, deleteDoc, doc } from '@angular/fire/firestore';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class FirebaseCleanupService {

  constructor(
    private firestore: Firestore,
    private authService: AuthService
  ) {}

  async clearAllUserData(): Promise<void> {
    const userId = this.authService.getCurrentUserId();
    if (!userId) {
      throw new Error('Usuário não está logado');
    }

    console.log('🧹 Iniciando limpeza dos dados do Firebase para usuário:', userId);

    try {
      // Limpar despesas
      const expensesRef = collection(this.firestore, 'expenses');
      const expensesQuery = query(expensesRef, where('userId', '==', userId));
      const expensesSnapshot = await getDocs(expensesQuery);
      
      console.log(`🗑️ Removendo ${expensesSnapshot.size} despesas...`);
      const expensePromises = expensesSnapshot.docs.map(docSnapshot => 
        deleteDoc(doc(this.firestore, 'expenses', docSnapshot.id))
      );
      await Promise.all(expensePromises);

      // Limpar metas
      const goalsRef = collection(this.firestore, 'goals');
      const goalsQuery = query(goalsRef, where('userId', '==', userId));
      const goalsSnapshot = await getDocs(goalsQuery);
      
      console.log(`🗑️ Removendo ${goalsSnapshot.size} metas...`);
      const goalPromises = goalsSnapshot.docs.map(docSnapshot => 
        deleteDoc(doc(this.firestore, 'goals', docSnapshot.id))
      );
      await Promise.all(goalPromises);

      console.log('✅ Limpeza concluída! Todos os dados do usuário foram removidos.');
      
    } catch (error) {
      console.error('❌ Erro ao limpar dados:', error);
      throw error;
    }
  }
}
