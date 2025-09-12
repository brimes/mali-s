# Guia de Resolução - Banco de Dados em Produção

## Problema
Erro ao tentar criar usuário admin em produção:
```
"Error code 14: Unable to open the database file"
```

## Causa
O arquivo de banco SQLite não existe no servidor de produção.

## ✅ Solução Principal: API Melhorada

A API `/api/init-admin` foi melhorada para **automaticamente verificar e criar o banco** se ele não existir. 

### Como usar:
```bash
curl -X POST http://seu-servidor.com/api/init-admin \
  -H "Authorization: Bearer seu-token-do-env" \
  -H "Content-Type: application/json"
```

A API agora:
1. ✅ Verifica se o banco existe
2. ✅ Cria a estrutura de diretórios se necessário  
3. ✅ Aplica o schema (`prisma db push`) automaticamente
4. ✅ Verifica conectividade
5. ✅ Cria o usuário admin se não existir
6. ✅ Retorna informações detalhadas sobre o processo

### Verificar status:
```bash
curl -X GET http://seu-servidor.com/api/init-admin \
  -H "Authorization: Bearer seu-token-do-env"
```

## Soluções Alternativas

### Solução 1: Via Script Automático
Execute no servidor de produção:

```bash
# Navegar para o diretório da aplicação
cd /var/www/mali-s  # ou onde está instalado

# Executar script de configuração rápida
./scripts/quick-db-setup.sh
```

### Solução 2: Comandos Manuais
Execute os comandos abaixo no servidor:

```bash
# 1. Navegar para diretório da aplicação
cd /var/www/mali-s

# 2. Criar estrutura de diretórios
mkdir -p prisma/data
chmod 775 prisma/data

# 3. Configurar ambiente
cp .env.production .env

# 4. Reinstalar Prisma
npm install @prisma/client prisma --force

# 5. Gerar cliente Prisma
npx prisma generate

# 6. Criar banco e aplicar schema
npx prisma db push --force-reset

# 7. Criar usuário admin
npx tsx scripts/init-db.ts

# 8. Reiniciar aplicação
pm2 restart mali-s
```

## Configuração Necessária

No arquivo `.env.production` do servidor, configure:
```bash
INIT_ADMIN_TOKEN="seu-token-seguro-aqui"
DATABASE_URL="file:./data/salon.db"
```

## Verificação
Após executar qualquer solução, verifique:

1. **Arquivo de banco criado:**
   ```bash
   ls -la prisma/data/salon.db
   ```

2. **Permissões corretas:**
   ```bash
   ls -la prisma/data/
   ```

3. **Status via API:**
   ```bash
   curl -X GET http://seu-servidor.com/api/init-admin \
     -H "Authorization: Bearer seu-token"
   ```

4. **Aplicação funcionando:**
   ```bash
   curl http://localhost:3000/api/health
   ```

## Credenciais do Admin
Após a configuração:
- **Email:** admin@mali-s.com
- **Senha:** Mali#2024@Admin!

⚠️ **IMPORTANTE:** Altere a senha após o primeiro login!

## Prevenção
Para evitar este problema no futuro:

1. **Deploy script atualizado:** Use o `deploy.sh` atualizado que configura o banco automaticamente

2. **Backup regular:** Configure backup automático do banco:
   ```bash
   # Adicionar ao crontab
   0 2 * * * cp /var/www/mali-s/prisma/data/salon.db /var/backups/mali-s/salon-$(date +\%Y\%m\%d).db
   ```

3. **Monitoramento:** Configure alertas para verificar a existência do arquivo de banco

## Troubleshooting

### Erro de permissões
```bash
sudo chown -R www-data:www-data /var/www/mali-s
sudo chmod -R 755 /var/www/mali-s
sudo chmod 775 /var/www/mali-s/prisma/data
```

### Erro de dependências
```bash
npm install --force
npx prisma generate
```

### Erro de memória
```bash
export NODE_OPTIONS="--max-old-space-size=384"
npm run build
```