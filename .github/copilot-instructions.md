# Mali-S - Sistema de Gerenciamento para Salão de Beleza

## Visão Geral da Arquitetura

Mali-S é um sistema de gerenciamento para salão de beleza multi-inquilino construído com Next.js 14, TypeScript, Prisma ORM e SQLite. O sistema suporta controle de acesso hierárquico entre 4 tipos de usuários gerenciando agendamentos, clientes, funcionários e serviços.

### Conceitos Fundamentais

- **Multi-inquilino**: Dados são isolados por `companyId` - toda entidade de negócio (clientes, funcionarios, servicos, agendamentos) pertence a uma empresa específica
- **Autenticação Hierárquica**: ADMIN → COMPANY_GROUP → COMPANY → EMPLOYEE com restrições progressivas de acesso
- **Sistema de Layout Duplo**: `(dashboard)` para usuários regulares, `(admin)` para administradores do sistema
- **Domínio em Português**: Todos os modelos de banco, endpoints de API e lógica de negócio usam nomenclatura em português

## Padrões de Autenticação e Autorização

### Estrutura da Sessão (NextAuth + JWT)
```typescript
session.user: {
  id: string
  userType: 'ADMIN' | 'COMPANY_GROUP' | 'COMPANY' | 'EMPLOYEE'
  companyId?: string      // Afiliação da empresa
  companyGroupId?: string // Afiliação do grupo de empresas
  company?: { id, name }
  companyGroup?: { id, name }
}
```

### Padrões de Acesso a Dados
- **ADMIN**: Acesso total ao sistema, sem filtro por empresa
- **COMPANY_GROUP**: Acesso a todas as empresas do seu grupo
- **COMPANY**: Acesso apenas aos dados da sua empresa específica
- **EMPLOYEE**: Acesso apenas aos dados da própria empresa (escopo limitado)

### Template de Autorização de API
```typescript
// Padrão usado em todas as rotas de API
let companyId = session.user.companyId

// Admins/Gerentes de grupo obtêm acesso de fallback à empresa
if (!companyId && (session.user.userType === 'ADMIN' || session.user.userType === 'COMPANY_GROUP')) {
  const firstCompany = await prisma.company.findFirst()
  companyId = firstCompany?.id
}

// Todos os dados de negócio devem incluir companyId
const cliente = await prisma.cliente.create({
  data: { ...validatedData, companyId }
})
```

## Estrutura de Diretórios e Roteamento

```
src/app/
├── (dashboard)/          # Rotas protegidas para usuários regulares
│   ├── layout.tsx        # Sidebar padrão + verificação de auth
│   ├── dashboard/        # Conteúdo do dashboard por função
│   ├── clientes/         # Gerenciamento de clientes
│   ├── funcionarios/     # Gerenciamento de funcionários
│   ├── servicos/         # Gerenciamento de serviços
│   └── agendamentos/     # Gerenciamento de agendamentos
├── (admin)/              # Rotas exclusivas para admin (userType === 'ADMIN')
│   ├── layout.tsx        # AdminSidebar + verificação de permissão admin
│   ├── admin/            # Dashboard administrativo
│   ├── users/            # Gerenciamento de usuários
│   ├── companies/        # Gerenciamento de empresas
│   └── settings/         # Configurações do sistema
└── api/                  # Rotas de API com filtro baseado em empresa
```

## Padrões de Banco de Dados e Prisma

### Convenções do Schema
- Todas as entidades de negócio têm chave estrangeira `companyId`
- Campos JSON armazenados como strings: `especialidades: JSON.stringify(['corte', 'pintura'])`
- Nomes de tabelas/campos em português: `clientes`, `funcionarios`, `servicos`, `agendamentos`
- Timestamps consistentes: `createdAt`/`updatedAt`

### Padrões de Consulta
```typescript
// Incluir contexto da empresa nas consultas
const funcionarios = await prisma.funcionario.findMany({
  where: { companyId },
  include: { company: { select: { id: true, name: true } } }
})

// Usar _count para estatísticas de entidades relacionadas
include: {
  _count: {
    select: { clientes: true, funcionarios: true, agendamentos: true }
  }
}
```

## Arquitetura de Componentes

### Componentes de Layout
- Hook `useAuthRequired()` em todos os layouts protegidos
- `AdminSidebar` vs `Sidebar` baseado no grupo de rotas
- Renderização condicional baseada em função usando `session.user.userType`

### Padrões de Navegação
```typescript
// Funções de navegação em componentes admin
const router = useRouter()
const handleNavigateToUsers = () => router.push('/admin/users')
```

### Isolamento de Dados em Componentes
Componentes respeitam automaticamente o contexto da empresa do usuário através dos dados da sessão.

## Fluxos de Desenvolvimento

### Desenvilvimento Local
- Não rode o ```npm run dev``` ele já vai estar rodando local.

### Operações de Banco de Dados
```bash
npm run db:generate    # Gerar cliente Prisma
npm run db:push       # Aplicar mudanças do schema
npm run db:seed       # Popular com dados de exemplo
npx tsx prisma/seed-auth.ts  # Criar usuários de teste
```

### Usuários de Teste (Pós-Seed)
- `admin@sistema.com` / `123456` - Acesso total ao sistema
- `gerente@belezatotal.com` / `123456` - Gerente de grupo de empresas
- `gerente.centro@belezatotal.com` / `123456` - Gerente de empresa individual
- `maria@belezatotal.com` / `123456` - Funcionário

### Deploy em Produção
- Banco SQLite em `prisma/data/salon.db` (pronto para produção para equipes pequenas)
- Configuração PM2 + Nginx em `ecosystem.config.js` e `nginx.conf`
- Script de deploy automatizado: `sudo ./deploy.sh`

## Pontos de Integração Principais

### Isolamento de Dados da Empresa
Todo endpoint de API verifica permissões do usuário e filtra dados por `companyId`. Ao criar novas entidades, sempre incluir a empresa associada ao usuário.

### Interface Baseada em Função
O conteúdo do dashboard muda baseado em `session.user.userType`. Usuários admin veem painéis de gerenciamento e estatísticas adicionais.

### Proteções de Navegação
- `middleware.ts` redireciona não-admins de rotas `/admin/*`
- `(admin)/layout.tsx` verifica permissões admin no lado cliente
- `useAuthRequired()` gerencia estado de autenticação em rotas protegidas

## Armadilhas Comuns

- Sempre incluir `companyId` ao criar entidades de negócio
- Usar `session.user.companyId` para filtro de dados, não parâmetros de query
- Rotas admin requerem verificações de permissão tanto server-side (middleware) quanto client-side (layout)
- Campos JSON no SQLite devem ser stringificados/parseados manualmente
- Nomes de campos em português em todo schema do banco e respostas da API