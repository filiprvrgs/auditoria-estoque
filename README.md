# Dashboard de Auditoria de Estoque

Sistema completo para auditoria de estoque com interface moderna e responsiva.

## ✅ Deploy Automático Testado

O Vercel está configurado para fazer deploy automático sempre que houver novos commits no GitHub.

## 🚀 Funcionalidades

### Tela de Entrada de Dados
- Formulário completo para inserção de dados de auditoria
- Campos para informações do auditor, local e data
- Adição de múltiplos itens com detalhes completos
- Validação de dados obrigatórios
- Interface intuitiva e responsiva

### Dashboard de Análise
- **Quantidade auditada vs quantidade real** com margem de erro
- **Quantidade de lotes não encontrados**
- **Quantidade de caixas não cadastradas**
- **Quantidade de caixas em local errado**
- Gráficos interativos e profissionais
- Métricas detalhadas de precisão
- Tabela de auditorias recentes

## 📊 Gráficos Disponíveis

1. **Gráfico de Barras**: Comparação entre quantidade esperada vs real
2. **Gráfico de Pizza**: Distribuição por status dos itens
3. **Gráfico de Linha**: Análise de erros ao longo do tempo
4. **Cards de Métricas**: Resumo visual dos principais indicadores

## 🛠️ Tecnologias Utilizadas

- **React 18** com TypeScript
- **Vite** para build e desenvolvimento
- **Tailwind CSS** para estilização
- **Recharts** para gráficos
- **Lucide React** para ícones
- **React Router** para navegação

## 📦 Instalação

1. Clone o repositório:
```bash
git clone <url-do-repositorio>
cd auditoria-estoque-dashboard
```

2. Instale as dependências:
```bash
npm install
```

3. Execute o projeto:
```bash
npm run dev
```

4. Acesse no navegador:
```
http://localhost:5173
```

## 🎯 Como Usar

### 1. Entrada de Dados
- Acesse a aba "Entrada de Dados"
- Preencha as informações da auditoria (data, auditor, local)
- Adicione itens com os detalhes necessários:
  - Código e nome do produto
  - Quantidade esperada vs real
  - Número do lote e caixa
  - Local correto vs atual
  - Status do item
- Salve a auditoria

### 2. Análise Gráfica
- Acesse a aba "Dashboard"
- Visualize os gráficos e métricas
- Analise a precisão geral
- Identifique problemas específicos

## 📈 Métricas Analisadas

- **Precisão Geral**: Percentual de acerto entre esperado vs real
- **Margem de Erro**: Diferença total entre quantidades
- **Lotes Não Encontrados**: Itens que não foram localizados
- **Caixas Não Cadastradas**: Itens sem registro no sistema
- **Localização Incorreta**: Itens em posições erradas

## 🎨 Design

- Interface moderna e profissional
- Paleta de cores consistente
- Layout responsivo para diferentes dispositivos
- Componentes reutilizáveis
- Animações suaves e transições

## 📱 Responsividade

O dashboard é totalmente responsivo e funciona em:
- Desktop (1920px+)
- Tablet (768px - 1024px)
- Mobile (320px - 767px)

## 🔧 Scripts Disponíveis

```bash
npm run dev          # Inicia o servidor de desenvolvimento
npm run build        # Gera build de produção
npm run preview      # Visualiza o build de produção
npm run lint         # Executa o linter
```

## 📋 Estrutura do Projeto

```
src/
├── components/      # Componentes reutilizáveis
├── pages/          # Páginas da aplicação
├── types/          # Definições de tipos TypeScript
├── App.tsx         # Componente principal
├── main.tsx        # Ponto de entrada
└── index.css       # Estilos globais
```

## 💾 Armazenamento

Os dados são salvos no localStorage do navegador, permitindo:
- Persistência entre sessões
- Múltiplas auditorias
- Análise histórica
- Backup local dos dados

## 🚀 Deploy

Para fazer deploy em produção:

```bash
npm run build
```

Os arquivos gerados estarão na pasta `dist/` e podem ser servidos por qualquer servidor web estático.

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. 