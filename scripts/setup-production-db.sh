#!/bin/bash

# Script para configurar banco de dados em produção
set -e

echo "🚀 Configurando banco de dados em produção..."

# Variáveis
APP_DIR="/var/www/mali-s"
DB_DIR="$APP_DIR/prisma/data"
DB_FILE="$DB_DIR/salon.db"

# Função para criar estrutura de diretórios
create_directories() {
    echo "📁 Criando estrutura de diretórios..."
    mkdir -p "$DB_DIR"
    
    # Garantir permissões corretas
    chown -R www-data:www-data "$APP_DIR"
    chmod -R 755 "$APP_DIR"
    chmod 775 "$DB_DIR"
    
    echo "✅ Diretórios criados"
}

# Função para configurar ambiente
setup_environment() {
    echo "⚙️  Configurando variáveis de ambiente..."
    
    cd "$APP_DIR"
    
    # Garantir que o arquivo .env.production existe
    if [ ! -f ".env.production" ]; then
        echo "❌ Arquivo .env.production não encontrado!"
        exit 1
    fi
    
    # Copiar configurações de produção
    cp .env.production .env
    
    echo "✅ Ambiente configurado"
}

# Função para configurar Prisma
setup_prisma() {
    echo "🔧 Configurando Prisma..."
    
    cd "$APP_DIR"
    
    # Limpar cache do Prisma
    rm -rf node_modules/.prisma
    rm -rf node_modules/@prisma
    
    # Reinstalar Prisma
    npm install @prisma/client prisma --force
    
    # Gerar cliente Prisma
    npx prisma generate
    
    echo "✅ Prisma configurado"
}

# Função para criar banco de dados
create_database() {
    echo "🗄️  Criando banco de dados..."
    
    cd "$APP_DIR"
    
    # Aplicar schema ao banco
    npx prisma db push --force-reset
    
    # Verificar se banco foi criado
    if [ -f "$DB_FILE" ]; then
        echo "✅ Banco de dados criado: $DB_FILE"
        
        # Configurar permissões do arquivo de banco
        chown www-data:www-data "$DB_FILE"
        chmod 664 "$DB_FILE"
    else
        echo "❌ Erro: Banco de dados não foi criado!"
        exit 1
    fi
}

# Função para popular banco com dados iniciais
seed_database() {
    echo "🌱 Populando banco com dados iniciais..."
    
    cd "$APP_DIR"
    
    # Executar script de seed
    npm run db:seed || true
    
    echo "✅ Banco populado"
}

# Função para criar usuário admin
create_admin_user() {
    echo "👤 Criando usuário admin..."
    
    cd "$APP_DIR"
    
    # Executar script de inicialização do admin
    npx tsx scripts/init-db.ts
    
    echo "✅ Usuário admin configurado"
}

# Função para testar conectividade
test_database() {
    echo "🧪 Testando conectividade com banco..."
    
    cd "$APP_DIR"
    
    # Testar conexão simples
    if npx prisma db execute --stdin <<< "SELECT name FROM sqlite_master WHERE type='table';" > /dev/null 2>&1; then
        echo "✅ Conectividade testada com sucesso"
    else
        echo "❌ Erro na conectividade do banco"
        exit 1
    fi
}

# Função para verificar status final
check_status() {
    echo "📊 Verificando status final..."
    
    echo "Arquivos criados:"
    ls -la "$DB_DIR"
    
    echo "Tamanho do banco:"
    du -h "$DB_FILE"
    
    echo "Permissões:"
    ls -la "$DB_FILE"
    
    echo "✅ Verificação concluída"
}

# Função principal
main() {
    echo "🏁 Iniciando configuração do banco em produção..."
    
    # Verificar se está rodando como root ou usuário apropriado
    if [ "$EUID" -ne 0 ] && [ "$(whoami)" != "www-data" ]; then
        echo "⚠️  Recomenda-se executar como root ou www-data"
    fi
    
    create_directories
    setup_environment
    setup_prisma
    create_database
    seed_database
    create_admin_user
    test_database
    check_status
    
    echo "🎉 Configuração do banco concluída com sucesso!"
    echo ""
    echo "📧 Admin Email: admin@mali-s.com"
    echo "🔑 Admin Senha: Mali#2024@Admin!"
    echo "⚠️  IMPORTANTE: Altere a senha após o primeiro login!"
}

# Executar script
main "$@"