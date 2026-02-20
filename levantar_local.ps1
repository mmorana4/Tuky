# Script para levantar Tuky en local (PowerShell)
# Requisito: Docker Desktop instalado y en ejecucion

$ErrorActionPreference = "Stop"
$projectRoot = $PSScriptRoot

Write-Host '=== Tuky - Levantar entorno local ===' -ForegroundColor Cyan
Write-Host ''

# 1. Verificar que existe .env
if (-not (Test-Path "$projectRoot\.env")) {
    Write-Host 'Creando .env desde .env.example...' -ForegroundColor Yellow
    Copy-Item "$projectRoot\.env.example" "$projectRoot\.env"
    Write-Host '  .env creado. Revisa POSTGRES_HOST=db y REDIS_HOST=redis' -ForegroundColor Gray
}
Write-Host ''

# 2. Levantar contenedores
Write-Host '[1/4] Levantando PostgreSQL, Redis y backend (Docker Compose)...' -ForegroundColor Green
Set-Location $projectRoot
docker-compose up -d --build
if ($LASTEXITCODE -ne 0) {
    Write-Host 'ERROR: Fallo docker-compose. Esta Docker Desktop en ejecucion?' -ForegroundColor Red
    exit 1
}

# 3. Esperar a que core-service este corriendo
Write-Host ''
Write-Host '[2/4] Esperando a que core-service este en ejecucion (hasta 90 s)...' -ForegroundColor Green
$maxWait = 90
$waited = 0
$coreRunning = $false
while ($waited -lt $maxWait) {
    $status = docker-compose ps -q core-service 2>$null
    if ($status) {
        $inspect = docker inspect -f "{{.State.Running}}" $status 2>$null
        if ($inspect -eq "true") { $coreRunning = $true; break }
    }
    Start-Sleep -Seconds 5
    $waited += 5
    Write-Host "  ... ${waited}s" -ForegroundColor Gray
}

if (-not $coreRunning) {
    Write-Host ''
    Write-Host 'ERROR: core-service no arranco. Ultimos logs:' -ForegroundColor Red
    docker-compose logs --tail=100 core-service
    Write-Host ''
    Write-Host 'Revisa el error arriba. Comun: fallo de migracion o conexion a DB/Redis.' -ForegroundColor Yellow
    Write-Host 'Para ver logs en vivo: docker-compose logs -f core-service' -ForegroundColor Gray
    exit 1
}
Write-Host '  core-service esta corriendo.' -ForegroundColor Green

# 4. Migraciones (evitar que stderr de docker-compose dispare excepcion)
Write-Host ''
Write-Host '[3/4] Ejecutando migraciones en core-service...' -ForegroundColor Green
$prevErrAction = $ErrorActionPreference
$ErrorActionPreference = 'Continue'
$migrateOut = docker-compose exec -T core-service python manage.py migrate --noinput 2>&1
$migrateOk = $LASTEXITCODE -eq 0
$ErrorActionPreference = $prevErrAction
if (-not $migrateOk) {
    $migrateOut
    Write-Host ''
    if ($migrateOut -match 'password authentication failed') {
        Write-Host 'SOLUCION - La base de datos se creo antes con otra contrasena.' -ForegroundColor Red
        Write-Host 'Ejecuta estos dos comandos (borra el volumen y vuelve a levantar):' -ForegroundColor Yellow
        Write-Host '  docker-compose down -v' -ForegroundColor White
        Write-Host '  .\levantar_local.ps1' -ForegroundColor White
    } else {
        Write-Host 'AVISO: Migraciones fallaron. Para mas detalle: docker-compose exec core-service python manage.py migrate --noinput' -ForegroundColor Yellow
    }
}

# 5. Usuario admin (opcional; no lanzar si falla)
Write-Host ''
Write-Host '[4/4] Creando usuario administrador (create_admin.py)...' -ForegroundColor Green
$ErrorActionPreference = 'Continue'
$null = docker-compose exec -T core-service python create_admin.py 2>&1
if ($LASTEXITCODE -ne 0) { Write-Host '  (Si ya existe el admin, puedes ignorar este mensaje)' -ForegroundColor Gray }
$ErrorActionPreference = $prevErrAction

Write-Host ''
Write-Host '=== Backend listo ===' -ForegroundColor Cyan
Write-Host '  API:        http://localhost:8000' -ForegroundColor White
Write-Host '  Swagger:    http://localhost:8000/swagger/' -ForegroundColor White
Write-Host '  Admin:      http://localhost:8000/admin/' -ForegroundColor White
Write-Host ''
Write-Host 'Frontend (React Native):' -ForegroundColor Cyan
Write-Host '  1. Edita frontend\src\utils\config.js y pon tu IP (o 10.0.2.2 para emulador Android)' -ForegroundColor White
Write-Host '  2. cd frontend' -ForegroundColor White
Write-Host '  3. npm install' -ForegroundColor White
Write-Host '  4. npx react-native start   (en una terminal)' -ForegroundColor White
Write-Host '  5. npx react-native run-android   (en otra)' -ForegroundColor White
Write-Host ''
Write-Host 'Para detener: docker-compose down' -ForegroundColor Gray
