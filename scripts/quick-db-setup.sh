#!/bin/bash

# Script rápido para inicializar banco em produção
# Execute este comando no servidor: curl -sSL url-do-script | bash

set -e

echo "🚀 Configuração rápida do banco Mali-S em produção..."

# Detectar diretório da aplicação
if [ -d "/var/www/mali-s" ]; then
    APP_DIR="/var/www/mali-s"
elif [ -d "/opt/mali-s" ]; then
    APP_DIR="/opt/mali-s"
elif [ -d "./prisma" ]; then
    APP_DIR="$(pwd)"
else
    echo "❌ Diretório da aplicação não encontrado!"
    echo "Execute este script no diretório raiz da aplicação ou configure APP_DIR"
    exit 1
fi

echo "📍 Diretório da aplicação: $APP_DIR"
cd "$APP_DIR"

# Criar estrutura de diretórios
echo "📁 Criando estrutura de diretórios..."
mkdir -p prisma/data
mkdir -p logs

# Configurar permissões
if command -v chown > /dev/null; then
    chown -R www-data:www-data . 2>/dev/null || true
fi
chmod -R 755 .
chmod 775 prisma/data 2>/dev/null || true

# Garantir arquivo de ambiente
echo "⚙️  Configurando ambiente..."
if [ -f ".env.production" ]; then
    cp .env.production .env
    echo "✅ Arquivo .env configurado"
else
    echo "DATABASE_URL=\"file:./data/salon.db\"" > .env
    echo "⚠️  Arquivo .env criado com configuração básica"
fi

# Instalar/atualizar dependências do Prisma
echo "🔧 Configurando Prisma..."
npm install @prisma/client prisma --force 2>/dev/null || {
    echo "⚠️  Erro ao instalar Prisma via npm. Tentando com yarn..."
    yarn add @prisma/client prisma 2>/dev/null || {
        echo "❌ Não foi possível instalar dependências do Prisma"
        echo "Execute manualmente: npm install @prisma/client prisma"
        exit 1
    }
}

# Gerar cliente Prisma
npx prisma generate

# Criar banco e aplicar schema
echo "🗄️  Criando banco de dados..."
npx prisma db push --force-reset

# Verificar se banco foi criado
if [ -f "prisma/data/salon.db" ]; then
    echo "✅ Banco criado: prisma/data/salon.db"
    chmod 664 prisma/data/salon.db 2>/dev/null || true
else
    echo "❌ Erro: Banco não foi criado!"
    exit 1
fi

# Criar usuário admin via Node.js inline
echo "👤 Criando usuário admin..."
node -e "
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

async function createAdmin() {
  const prisma = new PrismaClient();
  
  try {
    // Verificar se admin já existe
    const existing = await prisma.user.findFirst({
      where: { email: 'admin@mali-s.com', userType: 'ADMIN' }
    });
    
    if (!existing) {
      const hashedPassword = await bcrypt.hash('Mali#2024@Admin!', 12);
      
      await prisma.user.create({
        data: {
          name: 'Administrador do Sistema',
          email: 'admin@mali-s.com',
          password: hashedPassword,
          userType: 'ADMIN',
          active: true,
          phone: '(00) 00000-0000',
        }
      });
      
      console.log('✅ Usuário admin criado!');
    } else {
      console.log('✅ Usuário admin já existe.');
    }
  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  } finally {
    await prisma.\$disconnect();
  }
}

createAdmin();
"

# Testar conectividade
echo "🧪 Testando banco..."
npx prisma db execute --stdin <<< "SELECT COUNT(*) as total FROM users;" > /dev/null

echo ""
echo "🎉 Configuração concluída com sucesso!"
echo "📧 Admin Email: admin@mali-s.com"
echo "🔑 Admin Senha: Mali#2024@Admin!"
echo "⚠️  IMPORTANTE: Altere a senha após o primeiro login!"
echo ""
echo "Para reiniciar a aplicação:"
echo "pm2 restart mali-s"