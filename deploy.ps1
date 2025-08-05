# Script para Deploy Automático no GitHub e Vercel
Write-Host "Iniciando deploy automático..." -ForegroundColor Green

# Configurar Git
Write-Host "Configurando Git..." -ForegroundColor Yellow
& "C:\Program Files\Git\bin\git.exe" config --global user.name "filiprvrgs"
& "C:\Program Files\Git\bin\git.exe" config --global user.email "filiprvrgs@example.com"

# Inicializar repositório (se necessário)
Write-Host "Inicializando repositório..." -ForegroundColor Yellow
& "C:\Program Files\Git\bin\git.exe" init

# Adicionar todos os arquivos
Write-Host "Adicionando arquivos..." -ForegroundColor Yellow
& "C:\Program Files\Git\bin\git.exe" add .

# Fazer commit
Write-Host "Fazendo commit..." -ForegroundColor Yellow
& "C:\Program Files\Git\bin\git.exe" commit -m "Deploy inicial - Dashboard de Auditoria de Estoque"

# Conectar com repositório remoto
Write-Host "Conectando com GitHub..." -ForegroundColor Yellow
& "C:\Program Files\Git\bin\git.exe" remote add origin https://github.com/filiprvrgs/auditoria-estoque.git

# Enviar para GitHub
Write-Host "Enviando para GitHub..." -ForegroundColor Yellow
& "C:\Program Files\Git\bin\git.exe" push -u origin main

Write-Host "Deploy concluído!" -ForegroundColor Green
Write-Host "Agora acesse: https://vercel.com" -ForegroundColor Cyan
Write-Host "Importe o repositório: https://github.com/filiprvrgs/auditoria-estoque" -ForegroundColor Cyan 