// Debugging script - Monitor localStorage changes
(function() {
  console.log('🔍 Monitorando localStorage...');
  
  // Salvar métodos originais
  const originalSetItem = localStorage.setItem;
  const originalRemoveItem = localStorage.removeItem;
  const originalClear = localStorage.clear;
  
  // Interceptar setItem
  localStorage.setItem = function(key, value) {
    console.log('📝 localStorage.setItem chamado:', {
      key: key,
      value: value,
      stackTrace: new Error().stack
    });
    return originalSetItem.apply(this, arguments);
  };
  
  // Interceptar removeItem
  localStorage.removeItem = function(key) {
    console.log('🗑️ localStorage.removeItem chamado:', {
      key: key,
      stackTrace: new Error().stack
    });
    return originalRemoveItem.apply(this, arguments);
  };
  
  // Interceptar clear
  localStorage.clear = function() {
    console.log('🧹 localStorage.clear chamado:', {
      stackTrace: new Error().stack
    });
    return originalClear.apply(this, arguments);
  };
  
  console.log('✅ Monitoring localStorage ativo');
})();
