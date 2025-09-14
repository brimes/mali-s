# 🐳 Mali-S - Guia Docker

## 🚀 Início Rápido

### 1. Configuração Inicial (Primeira Vez)
```bash
# Configuração automática completa
make setup
```

### 2. Iniciar Aplicação
```bash
# Iniciar a aplicação
make up

# Ver logs em tempo real
make logs
```

### 3. Acessar Aplicação
- **URL**: http://localhost:3000
- **Admin**: admin@mali-s.com / Mali#2024@Admin!

## 📋 Comandos Disponíveis

### Principais
- `make setup` - Configuração inicial (primeira vez)
- `make up` - Iniciar aplicação
- `make down` - Parar aplicação
- `make restart` - Reiniciar aplicação
- `make rebuild` - Rebuild completo
- `make logs` - Ver logs
- `make status` - Status dos containers

### Banco de Dados
- `make db-reset` - Resetar banco
- `make db-backup` - Backup do banco
- `make db-restore FILE=backup.db` - Restaurar backup

### Desenvolvimento
- `make dev-shell` - Acessar shell do container
- `make clean-docker` - Limpar containers e imagens

### Limpeza e Reset
- `make clean-all` - Limpeza completa (CUIDADO!)
- `make reset` - Reset completo (clean + setup)

## 🔧 Solução para o Erro do Prisma

O erro que você estava enfrentando acontece porque:

1. O Prisma Client foi gerado para Linux (no container)
2. Você tentou rodar `npm run dev` diretamente no macOS
3. O binário do Prisma não é compatível entre sistemas

### Soluções:

#### Opção 1: Usar Docker (Recomendado)
```bash
make up  # Roda tudo no container
```

#### Opção 2: Desenvolvimento Local
```bash
# Gerar Prisma Client para macOS
make db-generate

# Iniciar localmente
make dev-next
```

## 🐛 Problemas Comuns

### Container não inicia
```bash
# Verificar logs
make logs

# Rebuild completo
make rebuild
```

### Banco não encontrado
```bash
# Resetar banco
make db-reset

# Ou restaurar backup
make db-restore FILE=backup.db
```

### Erro de permissões
```bash
# Limpar tudo e recriar
make clean-docker
make up
```

## 🔒 Configurações de Produção

Para produção, edite o arquivo `.env`:

```bash
NODE_ENV=production
NEXTAUTH_SECRET=seu-secret-super-seguro
NEXTAUTH_URL=https://seu-dominio.com
```

## 📊 Monitoramento

### Ver status
```bash
make status
```

### Ver logs específicos
```bash
docker-compose logs mali-s
```

### Acessar container
```bash
make dev-shell
```

## 🆘 Suporte

Se ainda tiver problemas:

1. Verifique se o Docker está rodando
2. Execute `make clean-docker` e `make up`
3. Verifique os logs com `make logs`

Para resetar completamente:
```bash
make reset  # Faz tudo: limpa + reconfigura + pronto para usar
```

## 🔄 Workflow Simplificado

### Primeira Vez
```bash
make setup    # Configuração inicial
make up       # Iniciar aplicação
```

### Desenvolvimento Diário
```bash
make up       # Iniciar
make logs     # Acompanhar (opcional)
# ... trabalhar ...
make down     # Parar ao final do dia
```

### Se Algo Der Errado
```bash
make reset    # Reset completo e volta a funcionar
```

### Gerenciamento de Dados
```bash
# Backup antes de mudanças importantes
make db-backup

# Reset se precisar limpar dados
make db-reset

# Restaurar se algo der errado
make db-restore FILE=backups/salon-backup-20240914-143000.db
```

## ⚡ Vantagens desta Solução

- ✅ **Elimina incompatibilidades**: Mesmo ambiente em qualquer sistema
- ✅ **Comandos simples**: `make up` ao invés de comandos complexos
- ✅ **Isolamento completo**: Não interfere no seu sistema local
- ✅ **Backup automático**: Dados sempre seguros
- ✅ **Logs organizados**: Fácil debugging
- ✅ **Healthcheck**: Container se auto-monitora