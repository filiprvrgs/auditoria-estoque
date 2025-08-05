# 🚀 Guia de Deploy - Dashboard de Auditoria de Estoque

## Opções de Hospedagem Gratuita

### 1. **Vercel (Recomendado)**
- **URL**: https://vercel.com
- **Vantagens**: Deploy automático, domínio gratuito, SSL automático
- **Tempo**: 2-3 minutos

### 2. **Netlify**
- **URL**: https://netlify.com
- **Vantagens**: Interface amigável, deploy automático
- **Tempo**: 3-5 minutos

### 3. **GitHub Pages**
- **Vantagens**: Totalmente gratuito, integração GitHub
- **Tempo**: 5-10 minutos

## 📋 Passos para Deploy no Vercel

### 1. Preparar o Projeto
```bash
# Testar build localmente
npm run build
```

### 2. Criar Repositório GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/seu-usuario/auditoria.git
git push -u origin main
```

### 3. Deploy no Vercel
1. Acesse [vercel.com](https://vercel.com)
2. Crie uma conta (pode usar GitHub)
3. Clique em "New Project"
4. Importe seu repositório
5. Clique em "Deploy"

### 4. Configurações Automáticas
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Framework**: Vite

## 🔧 Configurações Específicas

### Vercel
- O arquivo `vercel.json` já está configurado
- Deploy automático a cada push no GitHub

### Netlify
- Arraste a pasta `dist` para deploy manual
- Ou conecte GitHub para deploy automático

### GitHub Pages
- Ative GitHub Pages nas configurações do repositório
- Configure GitHub Actions para build automático

## 🌐 URLs de Exemplo
- **Vercel**: `https://auditoria-estoque.vercel.app`
- **Netlify**: `https://auditoria-estoque.netlify.app`
- **GitHub Pages**: `https://seu-usuario.github.io/auditoria`

## ⚠️ Importante
- O projeto usa `localStorage` para armazenar dados
- Os dados ficam salvos no navegador do usuário
- Não há banco de dados externo

## 🛠️ Troubleshooting

### Erro de Build
```bash
npm install
npm run build
```

### Erro de Roteamento
- Verifique se o `vercel.json` está configurado
- O arquivo já inclui as regras de rewrite para SPA

### Dados não Salvam
- Verifique se o navegador suporta `localStorage`
- Teste em modo incógnito 