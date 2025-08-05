# 🚀 Tutorial Completo - Deploy no Vercel

## 📋 Pré-requisitos
- Conta no GitHub (gratuita)
- Conta no Vercel (gratuita)
- Projeto funcionando localmente

## 🔧 Passo 1: Verificar se o Projeto Funciona

Primeiro, vamos testar se tudo está funcionando:

```bash
# Verificar se o build funciona
npm run build
```

Se der erro, execute:
```bash
npm install
npm run build
```

## 📁 Passo 2: Criar Repositório no GitHub

### 2.1 Acesse o GitHub
- Vá para [github.com](https://github.com)
- Faça login ou crie uma conta

### 2.2 Criar Novo Repositório
1. Clique no botão **"+"** no canto superior direito
2. Selecione **"New repository"**
3. Preencha:
   - **Repository name**: `auditoria-estoque`
   - **Description**: `Dashboard de Auditoria de Estoque`
   - **Public** (marque esta opção)
   - **NÃO** marque "Add a README file"
4. Clique em **"Create repository"**

## 💻 Passo 3: Enviar Código para GitHub

No terminal, execute estes comandos:

```bash
# Inicializar git (se ainda não foi feito)
git init

# Adicionar todos os arquivos
git add .

# Fazer primeiro commit
git commit -m "Primeiro commit - Dashboard de Auditoria"

# Conectar com o repositório GitHub (substitua SEU_USUARIO pelo seu nome de usuário)
git remote add origin https://github.com/SEU_USUARIO/auditoria-estoque.git

# Enviar para GitHub
git push -u origin main
```

**⚠️ IMPORTANTE**: Substitua `SEU_USUARIO` pelo seu nome de usuário do GitHub!

## 🌐 Passo 4: Deploy no Vercel

### 4.1 Criar Conta no Vercel
1. Acesse [vercel.com](https://vercel.com)
2. Clique em **"Sign Up"**
3. Escolha **"Continue with GitHub"**
4. Autorize o Vercel a acessar seu GitHub

### 4.2 Importar Projeto
1. Na dashboard do Vercel, clique em **"New Project"**
2. Na seção "Import Git Repository", você verá seu repositório `auditoria-estoque`
3. Clique em **"Import"**

### 4.3 Configurar Projeto
O Vercel vai detectar automaticamente que é um projeto Vite. As configurações devem ser:

- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 4.4 Deploy
1. Clique em **"Deploy"**
2. Aguarde 2-3 minutos
3. Seu site estará disponível em: `https://auditoria-estoque.vercel.app`

## 🔄 Passo 5: Deploy Automático

Agora, sempre que você fizer mudanças:

```bash
# Fazer mudanças no código...

# Adicionar mudanças
git add .

# Fazer commit
git commit -m "Descrição das mudanças"

# Enviar para GitHub
git push
```

O Vercel vai automaticamente fazer um novo deploy!

## 🛠️ Troubleshooting

### Erro: "Build failed"
```bash
# No terminal local, teste:
npm run build
```

Se der erro, verifique:
- Todos os arquivos estão salvos
- Não há erros de TypeScript
- Todas as dependências estão instaladas

### Erro: "Repository not found"
- Verifique se o nome do repositório está correto
- Verifique se o repositório é público
- Verifique se você tem permissão no repositório

### Erro: "Deploy failed"
1. Vá para a aba "Functions" no Vercel
2. Clique em "View Function Logs"
3. Verifique os erros específicos

## 📱 Testando o Deploy

Após o deploy, teste:
1. Acesse a URL fornecida pelo Vercel
2. Teste todas as funcionalidades:
   - Adicionar itens
   - Salvar auditoria
   - Ver dashboard
   - Ver gráficos

## 🎯 URLs Finais

- **Site**: `https://auditoria-estoque.vercel.app`
- **Dashboard Vercel**: `https://vercel.com/dashboard`
- **Repositório**: `https://github.com/SEU_USUARIO/auditoria-estoque`

## 💡 Dicas Importantes

1. **Sempre teste localmente primeiro**
2. **Use commits descritivos**
3. **O Vercel mantém histórico de deploys**
4. **Você pode reverter para versões anteriores**
5. **O domínio é gratuito e inclui SSL**

## 🆘 Precisa de Ajuda?

Se algo não funcionar:
1. Verifique os logs no Vercel
2. Teste localmente com `npm run build`
3. Verifique se todos os arquivos estão no GitHub
4. Confirme se o repositório é público

---

**🎉 Parabéns!** Seu dashboard está online e funcionando! 