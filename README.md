# Dashboard Financeiro Pessoal

Um aplicativo web moderno para controle financeiro pessoal desenvolvido com Angular 19, integrado com Firebase para autenticação e Firestore para armazenamento de dados na nuvem.

## 🚀 Funcionalidades

- **Autenticação Completa**: Sistema de login e cadastro com Firebase Authentication
- **Dashboard Interativo**: Visão geral das finanças com cards informativos
- **Gestão de Despesas**: Adicionar, editar e remover despesas com categorização
- **Gráficos Dinâmicos**: Visualização de dados financeiros com Chart.js
- **Metas Financeiras**: Definir e acompanhar metas de economia
- **IA para Sugestões**: Inteligência artificial que sugere cortes de gastos
- **Dados Isolados**: Cada usuário tem seus próprios dados isolados e seguros
- **Persistência na Nuvem**: Dados salvos no Firestore com backup local
- **Responsivo**: Interface adaptável para desktop e mobile
- **Segurança**: Regras de segurança que garantem acesso apenas aos próprios dados

## 🛠️ Tecnologias Utilizadas

- **Angular 19** - Framework principal com SSR
- **Firebase Authentication** - Sistema de autenticação
- **Firestore** - Banco de dados NoSQL na nuvem
- **Angular Material** - Componentes de UI
- **Chart.js** - Gráficos interativos
- **TypeScript** - Linguagem de programação
- **SCSS** - Estilização avançada
- **RxJS** - Programação reativa

## 📋 Pré-requisitos

- Node.js (versão 18 ou superior)
- npm ou yarn
- Conta no Firebase (gratuita)

## ⚙️ Configuração do Firebase

1. Acesse o [Firebase Console](https://console.firebase.google.com/)
2. Crie um novo projeto
3. Ative a Authentication com Email/Password
4. No painel de configurações do projeto, adicione um app Web
5. Copie as configurações do Firebase
6. Substitua as configurações nos arquivos:
   - `src/environments/environment.ts`
   - `src/environments/environment.prod.ts`

```typescript
export const environment = {
  production: false, // true para prod
  firebase: {
    apiKey: "sua-api-key",
    authDomain: "seu-projeto.firebaseapp.com",
    projectId: "seu-projeto-id",
    storageBucket: "seu-projeto.appspot.com",
    messagingSenderId: "123456789",
    appId: "seu-app-id"
  }
};
```

## 🔧 Instalação

1. Clone o repositório:
```bash
git clone [url-do-repositorio]
cd dashboard-financeiro
```

2. Instale as dependências:
```bash
npm install --legacy-peer-deps
```

3. Configure o Firebase (veja seção acima)

4. Execute o projeto:
```bash
npm start
```

5. Acesse `http://localhost:4200`

## 📱 Como Usar

### 1. Cadastro/Login
- Acesse a tela de login
- Crie uma nova conta ou faça login com credenciais existentes
- Cada usuário terá seus dados completamente isolados

### 2. Dashboard
- Visualize resumo das suas finanças
- Acompanhe gastos por categoria
- Monitore suas metas financeiras

### 3. Gestão de Despesas
- Adicione novas despesas com categoria, valor e data
- Edite ou remova despesas existentes
- Visualize histórico completo

### 4. Metas Financeiras
- Defina metas de economia
- Acompanhe progresso em tempo real
- Receba notificações de conquistas

### 5. Sugestões de IA
- Visualize sugestões automáticas para reduzir gastos
- Implemente ou descarte sugestões
- Acompanhe economia gerada

## 🏗️ Estrutura do Projeto

```
src/
├── app/
│   ├── components/
│   │   ├── auth/
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── dashboard/
│   │   ├── expense-form/
│   │   ├── expense-list/
│   │   ├── charts/
│   │   ├── goals/
│   │   ├── ai-suggestions/
│   │   └── shared/
│   │       └── navbar/
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── expense.service.ts
│   │   ├── goals.service.ts
│   │   ├── ai.service.ts
│   │   └── storage.service.ts
│   ├── models/
│   │   ├── user.model.ts
│   │   ├── expense.model.ts
│   │   ├── goal.model.ts
│   │   └── ai.model.ts
│   ├── guards/
│   │   └── auth.guard.ts
│   └── environments/
└── ...
```

## 🔒 Segurança

- Autenticação obrigatória para todas as funcionalidades
- Dados isolados por usuário
- Guards de rota para proteção de páginas
- Validação de formulários
- Sanitização de dados

## 📊 Funcionalidades Detalhadas

### Dashboard
- Cards de resumo: Total de despesas, economia atual, meta do mês
- Gráficos de pizza: Distribuição por categorias
- Gráficos de linha: Evolução temporal dos gastos
- Lista de despesas recentes

### Gestão de Despesas
- Formulário intuitivo para adicionar despesas
- Categorias predefinidas: Alimentação, Transporte, Moradia, etc.
- Filtros por data e categoria
- Edição inline de despesas

### Metas Financeiras
- Definição de valor e prazo
- Acompanhamento de progresso visual
- Notificações de marco alcançado
- Histórico de metas atingidas

### Sugestões de IA
- Análise automática de padrões de gasto
- Sugestões personalizadas de economia
- Priorização por impacto financeiro
- Feedback sobre implementação

## 🧪 Testes

```bash
# Testes unitários
npm run test

# Testes e2e
npm run e2e

# Cobertura de testes
npm run test:coverage
```

## 🚀 Deploy

### Build de Produção
```bash
npm run build
```

### Deploy no Firebase Hosting
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 👥 Autores

- **Seu Nome** - *Desenvolvimento inicial* - [SeuGitHub](https://github.com/seugithub)

## 🙏 Agradecimentos

- Angular Team pelos excelentes frameworks
- Material Design pela biblioteca de componentes
- Firebase pela infraestrutura robusta
- Chart.js pela biblioteca de gráficos

## 📧 Contato

Para dúvidas ou sugestões, entre em contato:
- Email: seu@email.com
- LinkedIn: [Seu Perfil](https://linkedin.com/in/seuperfil)

---

**Dashboard Financeiro Pessoal** - Controle suas finanças de forma inteligente! 💰
