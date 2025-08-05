# Instruções de Instalação

## Pré-requisitos

### 1. Instalar Node.js
Baixe e instale o Node.js do site oficial: https://nodejs.org/

Escolha a versão LTS (Long Term Support) para maior estabilidade.

### 2. Verificar Instalação
Após a instalação, abra o terminal e execute:

```bash
node --version
npm --version
```

Ambos devem retornar números de versão.

## Instalação do Projeto

### 1. Navegar para o diretório
```bash
cd auditoria
```

### 2. Instalar dependências
```bash
npm install
```

### 3. Executar o projeto
```bash
npm run dev
```

### 4. Acessar no navegador
Abra o navegador e acesse: http://localhost:5173

## Alternativa: Usar Yarn

Se preferir usar Yarn em vez do npm:

### 1. Instalar Yarn
```bash
npm install -g yarn
```

### 2. Instalar dependências
```bash
yarn install
```

### 3. Executar projeto
```bash
yarn dev
```

## Solução de Problemas

### Erro: "npm não é reconhecido"
- Reinstale o Node.js
- Reinicie o terminal após a instalação
- Verifique se o Node.js foi adicionado ao PATH do sistema

### Erro: "Porta 5173 já está em uso"
- Execute: `npm run dev -- --port 3000`
- Ou feche outros processos que possam estar usando a porta

### Erro: "Módulos não encontrados"
- Delete a pasta `node_modules`
- Delete o arquivo `package-lock.json`
- Execute: `npm install` novamente

## Estrutura do Projeto

```
auditoria/
├── src/
│   ├── components/
│   │   └── Layout.tsx
│   ├── pages/
│   │   ├── DataEntry.tsx
│   │   └── Dashboard.tsx
│   ├── types/
│   │   └── index.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
└── README.md
```

## Scripts Disponíveis

- `npm run dev` - Inicia servidor de desenvolvimento
- `npm run build` - Gera build de produção
- `npm run preview` - Visualiza build de produção
- `npm run lint` - Executa linter

## Tecnologias Utilizadas

- React 18 com TypeScript
- Vite para build
- Tailwind CSS para estilização
- Recharts para gráficos
- Lucide React para ícones
- React Router para navegação 