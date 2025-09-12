#!/bin/bash

# Script de deploy para VM com recursos limitados
set -e

echo "🚀 Iniciando deploy do Mali-S..."

# Variáveis
APP_DIR="/var/www/mali-s"
BACKUP_DIR="/var/backups/mali-s"
NODE_VERSION="18"

# Função para criar backup
create_backup() {
    echo "📦 Criando backup..."
    mkdir -p $BACKUP_DIR
    if [ -d "$APP_DIR" ]; then
        tar -czf "$BACKUP_DIR/backup-$(date +%Y%m%d-%H%M%S).tar.gz" -C "$APP_DIR" .
        echo "✅ Backup criado"
    fi
}

# Função para instalar dependências do sistema
install_system_deps() {
    echo "📋 Instalando dependências do sistema..."
    apt-get update
    apt-get install -y curl git nginx sqlite3
    
    # Instalar Node.js via NodeSource
    curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash -
    apt-get install -y nodejs
    
    # Instalar PM2 globalmente
    npm install -g pm2
    echo "✅ Dependências instaladas"
}

# Função para configurar aplicação
setup_app() {
    echo "🏗️  Configurando aplicação..."
    
    # Criar diretório da aplicação
    mkdir -p $APP_DIR
    cd $APP_DIR
    
    # Clonar ou atualizar código
    if [ ! -d ".git" ]; then
        git clone https://github.com/your-repo/mali-s.git .
    else
        git pull origin main
    fi
    
    # Instalar dependências
    npm ci --only=production
    
    # Criar diretório para dados
    mkdir -p data
    mkdir -p logs
    
    # Configurar permissões
    chown -R www-data:www-data $APP_DIR
    chmod -R 755 $APP_DIR
    
    echo "✅ Aplicação configurada"
}

# Função para configurar banco de dados
setup_database() {
    echo "🗃️  Configurando banco de dados..."
    cd $APP_DIR
    
    # Instalar dependências nativas necessárias para o Prisma
    apt-get install -y openssl libssl3 ca-certificates
    
    # Criar estrutura de diretórios necessária
    mkdir -p prisma/data
    mkdir -p logs
    
    # Limpar cache do Prisma para forçar regeneração
    rm -rf node_modules/.prisma
    rm -rf node_modules/@prisma
    
    # Reinstalar Prisma para arquitetura correta
    npm install @prisma/client prisma --force
    
    # Gerar Prisma client para a arquitetura atual
    npx prisma generate --no-engine
    npx prisma generate
    
    # Aplicar schema ao banco (criará o arquivo se não existir)
    npx prisma db push --force-reset
    
    # Verificar se banco foi criado
    if [ -f "prisma/data/salon.db" ]; then
        echo "✅ Banco de dados criado: prisma/data/salon.db"
        
        # Configurar permissões corretas
        chown www-data:www-data prisma/data/salon.db
        chmod 664 prisma/data/salon.db
    else
        echo "❌ Erro: Banco de dados não foi criado!"
        exit 1
    fi
    
    # Executar seed se banco estiver vazio ou for novo
    npm run db:seed || echo "⚠️  Seed falhou ou já foi executado"
    
    # Criar usuário admin usando script específico
    npx tsx scripts/init-db.ts || echo "⚠️  Criação do admin falhou ou já existe"
    
    echo "✅ Banco de dados configurado"
}

# Função para build da aplicação
build_app() {
    echo "🔨 Fazendo build da aplicação..."
    cd $APP_DIR
    
    # Build otimizado
    NODE_ENV=production npm run build
    
    echo "✅ Build concluído"
}

# Função para configurar Nginx
setup_nginx() {
    echo "🌐 Configurando Nginx..."
    
    # Copiar configuração
    cp $APP_DIR/nginx.conf /etc/nginx/sites-available/mali-s
    
    # Ativar site
    ln -sf /etc/nginx/sites-available/mali-s /etc/nginx/sites-enabled/
    
    # Remover site padrão
    rm -f /etc/nginx/sites-enabled/default
    
    # Testar configuração
    nginx -t
    
    # Recarregar Nginx
    systemctl reload nginx
    systemctl enable nginx
    
    echo "✅ Nginx configurado"
}

# Função para configurar PM2
setup_pm2() {
    echo "⚙️  Configurando PM2..."
    cd $APP_DIR
    
    # Parar aplicação se estiver rodando
    pm2 stop mali-s || true
    pm2 delete mali-s || true
    
    # Iniciar aplicação
    pm2 start ecosystem.config.js
    
    # Salvar configuração do PM2
    pm2 save
    
    # Configurar PM2 para iniciar no boot
    pm2 startup
    
    echo "✅ PM2 configurado"
}

# Função para configurar firewall
setup_firewall() {
    echo "🔒 Configurando firewall..."
    
    # Instalar ufw se não estiver instalado
    apt-get install -y ufw
    
    # Configurar regras básicas
    ufw default deny incoming
    ufw default allow outgoing
    
    # Permitir SSH, HTTP e HTTPS
    ufw allow ssh
    ufw allow 80
    ufw allow 443
    
    # Ativar firewall
    ufw --force enable
    
    echo "✅ Firewall configurado"
}

# Função para otimização do sistema
optimize_system() {
    echo "⚡ Otimizando sistema..."
    
    # Configurar swap se não existir
    if [ ! -f /swapfile ]; then
        fallocate -l 1G /swapfile
        chmod 600 /swapfile
        mkswap /swapfile
        swapon /swapfile
        echo '/swapfile none swap sw 0 0' >> /etc/fstab
        echo "✅ Swap configurado"
    fi
    
    # Otimizar configurações do kernel
    cat >> /etc/sysctl.conf << EOF
# Otimizações para aplicação Node.js
vm.swappiness=10
net.core.somaxconn=1024
net.ipv4.tcp_max_syn_backlog=1024
EOF
    
    sysctl -p
    
    echo "✅ Sistema otimizado"
}

# Função para verificar saúde da aplicação
health_check() {
    echo "🏥 Verificando saúde da aplicação..."
    
    # Aguardar aplicação iniciar
    sleep 10
    
    # Verificar se aplicação está respondendo
    if curl -f http://localhost:3000 > /dev/null 2>&1; then
        echo "✅ Aplicação está funcionando"
    else
        echo "❌ Aplicação não está respondendo"
        pm2 logs mali-s --lines 20
        exit 1
    fi
}

# Executar deploy
main() {
    echo "🏁 Iniciando deploy completo..."
    
    create_backup
    install_system_deps
    setup_app
    setup_database
    build_app
    setup_nginx
    setup_pm2
    setup_firewall
    optimize_system
    health_check
    
    echo "🎉 Deploy concluído com sucesso!"
    echo "📱 Aplicação disponível em: http://$(curl -s ifconfig.me)"
    echo "📊 Monitoramento: pm2 monit"
    echo "📋 Logs: pm2 logs mali-s"
}

# Verificar se é root
if [ "$EUID" -ne 0 ]; then
    echo "❌ Este script deve ser executado como root"
    exit 1
fi

# Executar deploy
main "$@"