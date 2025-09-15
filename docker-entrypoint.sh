#!/bin/sh

# Script de inicialização do container
set -e

echo "🚀 Iniciando container Mali-S..."

# Verificar se banco de dados existe
if [ ! -f "/app/data/salon.db" ]; then
    echo "📋 Banco não encontrado, inicializando..."
    
    # Tentar inicializar usando Prisma diretamente
    if [ -f "/app/prisma/schema.prisma" ]; then
        echo "🔧 Gerando cliente Prisma..."
        npx prisma generate
        
        echo "📦 Criando banco de dados..."
        npx prisma db push --force-reset
        
        echo "✅ Banco inicializado com sucesso!"
    else
        echo "⚠️ Schema Prisma não encontrado"
    fi
else
    echo "✅ Banco existente encontrado"
    # Garantir que o cliente Prisma está atualizado
    npx prisma generate
fi

# Ajustar permissões
chmod 664 /app/data/salon.db 2>/dev/null || true

# Garantir que o diretório .next existe
mkdir -p /app/.next 2>/dev/null || true

echo "🎉 Inicialização concluída!"

# Executar comando original
exec "$@"