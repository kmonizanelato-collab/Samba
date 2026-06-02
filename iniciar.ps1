# Script para iniciar o SAMBA localmente
$env:DATABASE_URL = "postgresql://postgres:kaic1806@localhost:5432/samba_db"
$env:NEXTAUTH_SECRET = "samba-escola-secret-key-mude-isso-em-producao"
$env:NEXTAUTH_URL = "http://localhost:3000"

Set-Location $PSScriptRoot
Write-Host "Iniciando SAMBA..." -ForegroundColor Blue
Write-Host "Acesse: http://localhost:3000" -ForegroundColor Green
npm run dev
