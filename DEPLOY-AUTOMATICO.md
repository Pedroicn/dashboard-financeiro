# 🚀 Configuração de Deploy Automático - GitHub Actions + Firebase

## ✅ Status Atual
- ✅ Projeto deployado manualmente: https://dashboard-financeiro-5dc0e.web.app
- ✅ GitHub Actions configurado
- ⚠️ Requer configuração manual da Service Account

## 🔧 Configuração do Deploy Automático

### 1. Criar Service Account no Firebase

1. Acesse o [Console do Firebase](https://console.firebase.google.com/project/dashboard-financeiro-5dc0e/settings/serviceaccounts/adminsdk)
2. Vá em **Configurações do Projeto** → **Contas de Serviço**
3. Clique em **Gerar nova chave privada**
4. Salve o arquivo JSON

### 2. Configurar GitHub Secrets

1. Acesse: https://github.com/Pedroicn/dashboard-financeiro/settings/secrets/actions
2. Clique em **New repository secret**
3. Nome: `FIREBASE_SERVICE_ACCOUNT`
4. Valor: Cole todo o conteúdo do arquivo JSON baixado

### 3. Como Funciona

Após a configuração, toda vez que você fizer push para `main` ou `master`:

```bash
git add .
git commit -m "Nova funcionalidade"
git push origin main
```

O GitHub Actions irá:
1. ✅ Fazer checkout do código
2. ✅ Instalar Node.js 18
3. ✅ Instalar dependências (`npm ci`)
4. ✅ Fazer build (`npm run build`)
5. ✅ Deploy para Firebase Hosting

## 🔍 Monitoramento

- **Actions**: https://github.com/Pedroicn/dashboard-financeiro/actions
- **Site**: https://dashboard-financeiro-5dc0e.web.app
- **Console Firebase**: https://console.firebase.google.com/project/dashboard-financeiro-5dc0e

## 🛠️ Deploy Manual (enquanto não configurar automático)

```bash
npm run build
firebase deploy --only hosting
```

## 📝 Arquivo de Configuração

O arquivo `.github/workflows/firebase-deploy.yml` já está configurado e pronto para usar assim que a Service Account for adicionada aos secrets do GitHub.
