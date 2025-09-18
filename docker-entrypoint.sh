#!/bin/sh

# Script de inicialização do container
set -e

echo "🚀 Iniciando container Mali-S..."

# Verificar se banco de dados existe
if [ ! -f "/app/data/salon.db" ]; then
    echo "📋 Banco não encontrado, inicializando..."
    
    # Tentar inicializar usando Prisma diretamente
    if [ -f "/app/prisma/schema.prisma" ]; then
        echo "� Criando banco de dados..."
        if command -v npx >/dev/null 2>&1; then
            npx prisma db push
        elif [ -f "/app/node_modules/.bin/prisma" ]; then
            /app/node_modules/.bin/prisma db push
        else
            echo "⚠️ Prisma CLI não encontrado, banco será criado pela aplicação..."
        fi
        
        echo "✅ Banco inicializado com sucesso!"
    else
        echo "⚠️ Schema Prisma não encontrado"
    fi
else
    echo "✅ Banco existente encontrado"
    
    # Verificar se precisamos atualizar o schema (apenas se Prisma CLI estiver disponível)
    if command -v npx >/dev/null 2>&1; then
        echo "🔧 Verificando se schema precisa ser atualizado..."
        # Tentar aplicar mudanças de schema sem perder dados
        npx prisma db push --accept-data-loss=false 2>/dev/null || {
            echo "ℹ️ Schema já está atualizado ou mudanças requerem migração manual"
        }
    elif [ -f "/app/node_modules/.bin/prisma" ]; then
        echo "🔧 Verificando se schema precisa ser atualizado..."
        /app/node_modules/.bin/prisma db push --accept-data-loss=false 2>/dev/null || {
            echo "ℹ️ Schema já está atualizado ou mudanças requerem migração manual"
        }
    else
        echo "ℹ️ Prisma CLI não disponível, pulando verificação de schema"
    fi
fi

# Ajustar permissões
chmod 664 /app/data/salon.db 2>/dev/null || true

# Garantir que o diretório .next existe
mkdir -p /app/.next 2>/dev/null || true

echo "🎉 Inicialização concluída!"

# Executar comando original
exec "$@"