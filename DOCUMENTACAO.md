# 🔧 DOCUMENTAÇÃO TÉCNICA - Mali-S

## 🏗️ Arquitetura do Sistema

### Stack Tecnológica
- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS
- **Backend**: Next.js API Routes
- **Banco**: SQLite + Prisma ORM
- **Deploy**: Docker + Nginx + PM2
- **Otimização**: Para VMs com poucos recursos

### Estrutura de Diretórios
```
mali-s/
├── prisma/
│   ├── schema.prisma      # Schema do banco
│   └── seed.ts           # Dados iniciais
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── (dashboard)/  # Rotas do dashboard
│   │   ├── api/          # API Routes
│   │   ├── globals.css   # Estilos globais
│   │   ├── layout.tsx    # Layout principal
│   │   └── page.tsx      # Página inicial
│   ├── components/       # Componentes React
│   │   ├── ui/           # Componentes base
│   │   ├── dashboard/    # Componentes do dashboard
│   │   └── sidebar.tsx   # Navegação lateral
│   ├── lib/              # Utilitários
│   │   ├── prisma.ts     # Cliente Prisma
│   │   ├── utils.ts      # Funções utilitárias
│   │   └── validations.ts # Schemas Zod
│   └── types/            # Definições TypeScript
├── docker/               # Configurações Docker
├── deploy.sh            # Script de deploy
├── ecosystem.config.js  # Configuração PM2
└── nginx.conf           # Configuração Nginx
```

## 📊 Banco de Dados

### Schema Prisma
```prisma
// Clientes
model Cliente {
  id           String        @id @default(cuid())
  nome         String
  telefone     String        @unique
  email        String?
  observacoes  String?
  createdAt    DateTime      @default(now())
  agendamentos Agendamento[]
}

// Funcionários
model Funcionario {
  id             String        @id @default(cuid())
  nome           String
  telefone       String
  especialidades String        // JSON array
  horarioInicio  String        // "08:00"
  horarioFim     String        // "18:00"
  diasTrabalho   String        // JSON array
  ativo          Boolean       @default(true)
  agendamentos   Agendamento[]
  createdAt      DateTime      @default(now())
}

// Serviços
model Servico {
  id           String        @id @default(cuid())
  nome         String
  descricao    String?
  duracao      Int           // minutos
  preco        Float
  categoria    String
  ativo        Boolean       @default(true)
  agendamentos Agendamento[]
  createdAt    DateTime      @default(now())
}

// Agendamentos
model Agendamento {
  id            String      @id @default(cuid())
  dataHora      DateTime
  clienteId     String
  funcionarioId String
  servicoId     String
  status        String      @default("agendado")
  observacoes   String?
  preco         Float?
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
  
  cliente       Cliente     @relation(fields: [clienteId], references: [id])
  funcionario   Funcionario @relation(fields: [funcionarioId], references: [id])
  servico       Servico     @relation(fields: [servicoId], references: [id])
}
```

### Relacionamentos
- **1:N** - Cliente → Agendamentos
- **1:N** - Funcionário → Agendamentos  
- **1:N** - Serviço → Agendamentos

## 🔌 API Routes

### Endpoints Disponíveis

#### Clientes
```
GET    /api/clientes          # Listar clientes
POST   /api/clientes          # Criar cliente
GET    /api/clientes/[id]     # Buscar cliente
PUT    /api/clientes/[id]     # Atualizar cliente
DELETE /api/clientes/[id]     # Deletar cliente
```

#### Funcionários
```
GET    /api/funcionarios      # Listar funcionários
POST   /api/funcionarios      # Criar funcionário
GET    /api/funcionarios/[id] # Buscar funcionário
PUT    /api/funcionarios/[id] # Atualizar funcionário
DELETE /api/funcionarios/[id] # Deletar funcionário
```

#### Serviços
```
GET    /api/servicos          # Listar serviços
POST   /api/servicos          # Criar serviço
GET    /api/servicos/[id]     # Buscar serviço
PUT    /api/servicos/[id]     # Atualizar serviço
DELETE /api/servicos/[id]     # Deletar serviço
```

#### Agendamentos
```
GET    /api/agendamentos      # Listar agendamentos
POST   /api/agendamentos      # Criar agendamento
GET    /api/agendamentos/[id] # Buscar agendamento
PUT    /api/agendamentos/[id] # Atualizar agendamento
DELETE /api/agendamentos/[id] # Deletar agendamento
```

### Exemplo de Request/Response

#### POST /api/clientes
```json
// Request
{
  "nome": "Maria Silva",
  "telefone": "11999999999",
  "email": "maria@email.com",
  "observacoes": "Cliente VIP"
}

// Response (201)
{
  "id": "clp2q3r4s5t6u7v8w9x0y1z2",
  "nome": "Maria Silva",
  "telefone": "11999999999",
  "email": "maria@email.com",
  "observacoes": "Cliente VIP",
  "createdAt": "2024-11-15T10:30:00.000Z"
}
```

## 🎨 Componentes UI

### Componentes Base (src/components/ui/)
- **Button**: Botões com variantes (default, outline, ghost, etc.)
- **Card**: Container para conteúdo com header/footer
- **Input**: Campo de entrada de texto
- **Label**: Rótulos para formulários
- **Textarea**: Campo de texto multilinha

### Componentes Específicos
- **Sidebar**: Navegação lateral principal
- **DashboardStats**: Cards de estatísticas
- **RecentAppointments**: Lista de próximos agendamentos
- **QuickActions**: Ações rápidas do dashboard

## 🔐 Validação de Dados

### Schemas Zod (src/lib/validations.ts)

```typescript
// Cliente
const clienteSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  telefone: z.string().min(10, 'Telefone deve ter pelo menos 10 dígitos'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  observacoes: z.string().optional(),
})

// Funcionário
const funcionarioSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  telefone: z.string().min(10, 'Telefone deve ter pelo menos 10 dígitos'),
  especialidades: z.array(z.string()).min(1, 'Selecione pelo menos uma especialidade'),
  horarioInicio: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato inválido (HH:MM)'),
  horarioFim: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato inválido (HH:MM)'),
  diasTrabalho: z.array(z.string()).min(1, 'Selecione pelo menos um dia'),
  ativo: z.boolean().default(true),
})

// Serviço
const servicoSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  descricao: z.string().optional(),
  duracao: z.number().min(15, 'Duração mínima de 15 minutos'),
  preco: z.number().min(0.01, 'Preço deve ser maior que zero'),
  categoria: z.string().min(1, 'Categoria é obrigatória'),
  ativo: z.boolean().default(true),
})

// Agendamento
const agendamentoSchema = z.object({
  dataHora: z.date(),
  clienteId: z.string().min(1, 'Cliente é obrigatório'),
  funcionarioId: z.string().min(1, 'Funcionário é obrigatório'),
  servicoId: z.string().min(1, 'Serviço é obrigatório'),
  status: z.enum(['agendado', 'concluido', 'cancelado']).default('agendado'),
  observacoes: z.string().optional(),
  preco: z.number().positive().optional(),
})
```

## 🚀 Deploy e Produção

### Configuração Docker

#### Dockerfile Otimizado
```dockerfile
# Multi-stage build para otimizar tamanho
FROM node:18-alpine AS base
FROM base AS deps
FROM node:18-alpine AS builder
FROM node:18-alpine AS production

# Configurações de segurança e performance
USER nextjs
EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"
```

#### Docker Compose
```yaml
version: '3.8'
services:
  mali-s:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - NODE_OPTIONS=--max-old-space-size=512
    volumes:
      - ./data:/app/data
    restart: unless-stopped
    mem_limit: 1g
    cpus: 1.0
```

### Configuração PM2

#### ecosystem.config.js
```javascript
module.exports = {
  apps: [{
    name: "mali-s",
    script: "npm",
    args: "start",
    instances: 1,
    exec_mode: "cluster",
    watch: false,
    max_memory_restart: "512M",
    env: {
      NODE_ENV: "production",
      PORT: 3000,
      NODE_OPTIONS: "--max-old-space-size=512"
    }
  }]
}
```

### Configuração Nginx

#### Otimizações
- **Gzip**: Compressão de assets
- **Cache**: Cache agressivo para arquivos estáticos
- **SSL**: Configuração HTTPS
- **Rate Limiting**: Proteção contra ataques
- **Security Headers**: Cabeçalhos de segurança

## ⚡ Otimizações para VMs

### Performance
- **Memory Limit**: Node.js limitado a 512MB
- **Bundle Size**: Tree-shaking agressivo
- **Image Optimization**: Desabilitado (Nginx faz)
- **Telemetry**: Desabilitado
- **Standalone Output**: Build otimizado

### Monitoramento
```bash
# PM2 Status
pm2 status

# Monitoramento em tempo real
pm2 monit

# Logs
pm2 logs mali-s

# Restart
pm2 restart mali-s
```

## 🔧 Desenvolvimento

### Scripts Disponíveis
```bash
# Desenvolvimento
npm run dev          # Iniciar dev server
npm run build        # Build para produção
npm run start        # Iniciar produção
npm run lint         # Verificar código

# Banco de dados
npm run db:generate  # Gerar Prisma client
npm run db:push      # Aplicar schema
npm run db:studio    # Abrir Prisma Studio
npm run db:seed      # Popular banco
```

### Variáveis de Ambiente
```bash
# Desenvolvimento
NODE_ENV=development
DATABASE_URL="file:./data/salon.db"

# Produção
NODE_ENV=production
DATABASE_URL="file:./data/salon.db"
NEXTAUTH_SECRET="seu-secret-aqui"
NEXTAUTH_URL="https://seu-dominio.com"
NODE_OPTIONS="--max-old-space-size=512"
NEXT_TELEMETRY_DISABLED=1
```

## 📝 Logs e Debugging

### Logs do Sistema
- **PM2 Logs**: `/logs/combined.log`
- **Error Logs**: `/logs/err.log`
- **Output Logs**: `/logs/out.log`
- **Nginx Logs**: `/var/log/nginx/`

### Debug Mode
```bash
# Debug Next.js
DEBUG=* npm run dev

# Debug Prisma
DEBUG="prisma*" npm run dev
```

## 🔄 Backup e Restauração

### Backup SQLite
```bash
# Backup manual
cp data/salon.db backup/salon-$(date +%Y%m%d).db

# Backup automático (cron)
0 2 * * * /path/to/backup-script.sh
```

### Migração PostgreSQL
```bash
# Quando necessário migrar para PostgreSQL
# 1. Atualizar schema.prisma
# 2. Executar migração
npx prisma migrate dev --name migration-postgres
```

## 📊 Métricas e Analytics

### Dashboard Stats
- Total de clientes
- Agendamentos hoje
- Serviços ativos  
- Faturamento mensal

### KPIs Importantes
- Taxa de ocupação dos funcionários
- Tempo médio por serviço
- Receita por cliente
- Taxa de cancelamento

---

## 🎯 Próximas Implementações

### Features Futuras
- [ ] Notificações via WhatsApp
- [ ] Relatórios detalhados
- [ ] Sistema de comissões
- [ ] App mobile
- [ ] Integração com sistemas de pagamento
- [ ] Backup automático na nuvem

### Melhorias Técnicas
- [ ] Testes automatizados
- [ ] CI/CD pipeline
- [ ] Monitoring com Grafana
- [ ] Redis para cache
- [ ] Replicação de banco