// Script para limpar dados do Firebase Firestore
// Execute este código no console do navegador após fazer login

async function clearFirebaseData() {
  console.log('🧹 Iniciando limpeza dos dados do Firebase...');
  
  // Verificar se o usuário está logado
  const user = firebase.auth().currentUser;
  if (!user) {
    console.error('❌ Usuário não está logado. Faça login primeiro.');
    return;
  }
  
  console.log('👤 Usuário logado:', user.uid);
  
  const db = firebase.firestore();
  
  try {
    // Limpar despesas do usuário
    console.log('🗑️ Limpando despesas...');
    const expensesQuery = await db.collection('expenses').where('userId', '==', user.uid).get();
    const expensesBatch = db.batch();
    
    expensesQuery.docs.forEach(doc => {
      expensesBatch.delete(doc.ref);
    });
    
    if (!expensesQuery.empty) {
      await expensesBatch.commit();
      console.log(`✅ ${expensesQuery.size} despesas removidas`);
    } else {
      console.log('ℹ️ Nenhuma despesa encontrada');
    }
    
    // Limpar metas do usuário
    console.log('🗑️ Limpando metas...');
    const goalsQuery = await db.collection('goals').where('userId', '==', user.uid).get();
    const goalsBatch = db.batch();
    
    goalsQuery.docs.forEach(doc => {
      goalsBatch.delete(doc.ref);
    });
    
    if (!goalsQuery.empty) {
      await goalsBatch.commit();
      console.log(`✅ ${goalsQuery.size} metas removidas`);
    } else {
      console.log('ℹ️ Nenhuma meta encontrada');
    }
    
    console.log('🎉 Limpeza concluída! Dados do Firebase removidos com sucesso.');
    console.log('🔄 Atualize a página para ver os dados limpos.');
    
  } catch (error) {
    console.error('❌ Erro ao limpar dados:', error);
  }
}

// Executar a limpeza
clearFirebaseData();
