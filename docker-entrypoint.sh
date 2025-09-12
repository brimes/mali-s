#!/bin/sh

# Script de inicialização do container
set -e

echo "🚀 Iniciando container Mali-S..."

# Verificar se banco de dados existe
if [ ! -f "/app/data/salon.db" ]; then
    echo "📋 Banco não encontrado, copiando banco inicial..."
    
    if [ -f "/app/prisma/data/salon.initial.db" ]; then
        cp /app/prisma/data/salon.initial.db /app/data/salon.db
        echo "✅ Banco inicial copiado com sucesso!"
    else
        echo "⚠️  Banco inicial não encontrado no container"
    fi
else
    echo "✅ Banco existente encontrado"
fi

# Ajustar permissões
chmod 664 /app/data/salon.db 2>/dev/null || true

echo "🎉 Inicialização concluída!"

# Executar comando original
exec "$@"