#!/bin/sh

# Inicialização do container com migrações otimizadas
set -e

echo "🚀 Iniciando container Mali-S..."

# Verificar se banco de dados existe
if [ ! -f "/app/data/salon.db" ]; then
    echo "📋 Banco não encontrado, inicializando..."
    
    # Tentar criar banco usando Prisma
    if [ -f "/app/prisma/schema.prisma" ]; then
        echo "📦 Criando banco de dados..."
        if [ -f "/app/node_modules/.bin/prisma" ]; then
            /app/node_modules/.bin/prisma db push --skip-generate 2>/dev/null && echo "✅ Banco criado com sucesso!" || {
                echo "⚠️ Erro ao criar banco, será criado pela aplicação..."
            }
        else
            echo "⚠️ Prisma CLI não encontrado, banco será criado pela aplicação..."
        fi
    else
        echo "⚠️ Schema Prisma não encontrado"
    fi
else
    echo "✅ Banco existente encontrado"
    
    # Aplicar migrações se disponível
    if [ -f "/app/node_modules/.bin/prisma" ] && [ -f "/app/prisma/schema.prisma" ]; then
        echo "🔧 Verificando se schema precisa ser atualizado..."
        /app/node_modules/.bin/prisma db push --skip-generate --accept-data-loss=false 2>/dev/null && {
            echo "✅ Schema atualizado com sucesso!"
        } || {
            echo "ℹ️ Schema já está atualizado ou sem mudanças compatíveis"
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
