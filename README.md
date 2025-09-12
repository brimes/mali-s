# Mali-S - Sistema de Agendamento para Salão de Beleza

Sistema completo de agendamento para salão de beleza desenvolvido com Next.js 14, TypeScript, Prisma e SQLite, com sistema de autenticação e controle de acesso baseado em funções, otimizado para deploy em VM com recursos limitados.

## 🚀 Características

- **Framework**: Next.js 14 com App Router
- **Linguagem**: TypeScript
- **Banco de Dados**: SQLite com Prisma ORM (migração futura para PostgreSQL)
- **Autenticação**: NextAuth.js com controle de acesso baseado em funções
- **Estilização**: Tailwind CSS
- **Deploy**: Docker + Nginx + PM2
- **Otimização**: Para VMs com poucos recursos

## 📋 Funcionalidades

### Sistema de Autenticação e Autorização
- **4 Tipos de Usuário**:
  - **ADMIN**: Administrador geral do sistema (acesso total)
  - **COMPANY_GROUP**: Gerente de rede (múltiplas lojas)
  - **COMPANY**: Gerente de loja individual
  - **EMPLOYEE**: Funcionário da loja
- **Login Seguro**: Autenticação com email e senha
- **Controle de Acesso**: Baseado no tipo de usuário e empresa
- **Sessões Seguras**: JWT com NextAuth.js

### Gestão Multiempresarial
- **Grupos de Empresas**: Gerenciamento de redes/franquias
- **Empresas**: Lojas individuais com dados próprios
- **Isolamento de Dados**: Cada empresa vê apenas seus dados
- **Hierarquia de Acesso**: Controle granular por nível

### Gestão Completa
- **Clientes**: Cadastro, edição, histórico de agendamentos
- **Funcionários**: Cadastro, especialidades, horários de trabalho
- **Serviços**: Tipos, duração, preços, categorias
- **Agendamentos**: Criação, edição, cancelamento, controle de status

### Interface
- **Dashboard**: Métricas e visão geral por empresa
- **Calendário Visual**: Visualização por dia/semana/mês
- **Sidebar Inteligente**: Mostra informações do usuário logado
- **Responsivo**: Funciona em desktop, tablet e mobile

## 👥 Usuários de Teste

Após executar o seed do banco, você pode usar os seguintes usuários para teste:

```
Administrador Geral:
- Email: admin@sistema.com
- Senha: 123456
- Acesso: Sistema completo

Gerente de Rede:
- Email: gerente@belezatotal.com  
- Senha: 123456
- Acesso: Todas as lojas da rede

Gerente de Loja:
- Email: gerente.centro@belezatotal.com
- Senha: 123456
- Acesso: Loja específica

Funcionário:
- Email: maria@belezatotal.com
- Senha: 123456
- Acesso: Loja específica (limitado)
```

## 🛠️ Instalação e Desenvolvimento

### Pré-requisitos
- Node.js 18+ 
- npm ou yarn

### Instalação Local

```bash
# Clonar repositório
git clone https://github.com/your-repo/mali-s.git
cd mali-s

# Instalar dependências
npm install

# Configurar banco de dados
npm run db:generate
npm run db:push

# Opcional: Popular com dados de exemplo
npm run db:seed

# Executar em desenvolvimento
npm run dev
```

### 🔐 Inicialização Automática do Administrador

O sistema possui **inicialização automática** do usuário administrador de forma segura. Quando a aplicação é iniciada pela primeira vez ou quando o banco de dados não existe, o sistema automaticamente:

1. **Verifica a existência do banco de dados**
2. **Cria a estrutura necessária** se não existir  
3. **Cria o usuário administrador padrão** se não existir

**Credenciais do Admin Padrão:**
- **Email**: `admin@mali-s.com`
- **Senha**: `Mali#2024@Admin!`

> ⚠️ **IMPORTANTE**: Altere a senha padrão após o primeiro login por segurança!

#### Métodos de Inicialização

**Desenvolvimento** (automático):
```bash
npm run dev    # Executa inicialização + desenvolvimento
```

**Produção Docker** (automático):
```bash
docker build -t mali-s .
docker run -p 3000:3000 mali-s  # Inicialização automática no container
```

**Manual**:
```bash
# Executar script de inicialização manualmente
npm run db:init
# ou diretamente
node scripts/init-db.js
```

#### 🔒 Recursos de Segurança

- ✅ **Inicialização server-side apenas** - Sem endpoints públicos expostos
- ✅ **Verificação de duplicatas** - Não recria se admin já existe
- ✅ **Hash bcrypt** - Senha com 12 rounds de encriptação
- ✅ **Fallback gracioso** - Aplicação continua mesmo com erro na inicialização
- ✅ **Logs informativos** - Status detalhado do processo

> �️ **Nota de Segurança**: A inicialização é feita exclusivamente no lado servidor através de scripts, sem exposição de endpoints da API ou funcionalidades client-side que possam ser exploradas.

# Popular com dados de exemplo (incluindo usuários)
npm run db:seed
npx tsx prisma/seed-auth.ts

# Iniciar em desenvolvimento
npm run dev
```

Acesse http://localhost:3000

### Configuração do Banco

O projeto usa SQLite por padrão. Configure a URL no arquivo `.env`:

```env
NODE_ENV=development
DATABASE_URL="file:./data/salon.db"
NEXTAUTH_SECRET="mali-s-secret-key-development-only"
NEXTAUTH_URL="http://localhost:3000"
```

## 🐳 Deploy com Docker

### Build da Imagem

```bash
# Build da imagem
docker build -t mali-s .

# Executar container
docker run -p 3000:3000 \
  -v $(pwd)/data:/app/data \
  -e NODE_ENV=production \
  mali-s
```

### Docker Compose

```bash
# Subir aplicação
docker-compose up -d

# Ver logs
docker-compose logs -f
```

## 🚀 Deploy em Produção (VM)

### Deploy Automatizado

Para deploy em VM Ubuntu/Debian:

```bash
# Tornar script executável
chmod +x deploy.sh

# Executar deploy (como root)
sudo ./deploy.sh
```

O script automático irá:
- Instalar Node.js, Nginx, PM2
- Configurar aplicação e banco
- Configurar SSL e firewall
- Otimizar sistema para poucos recursos

### Deploy Manual

1. **Preparar Servidor**
```bash
# Instalar dependências
sudo apt update
sudo apt install -y curl git nginx sqlite3

# Instalar Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Instalar PM2
sudo npm install -g pm2
```

2. **Configurar Aplicação**
```bash
# Clonar código
git clone https://github.com/your-repo/mali-s.git /var/www/mali-s
cd /var/www/mali-s

# Instalar dependências
npm ci --only=production

# Configurar banco
npm run db:generate
npm run db:push
npm run db:seed

# Build da aplicação
npm run build
```

3. **Configurar PM2**
```bash
# Iniciar aplicação
pm2 start ecosystem.config.js

# Salvar configuração
pm2 save
pm2 startup
```

4. **Configurar Nginx**
```bash
# Copiar configuração
sudo cp nginx.conf /etc/nginx/sites-available/mali-s
sudo ln -s /etc/nginx/sites-available/mali-s /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default

# Reiniciar Nginx
sudo nginx -t
sudo systemctl restart nginx
```

## ⚡ Otimizações para VMs com Poucos Recursos

### Configurações de Performance

1. **Node.js Memory Limit**
```bash
export NODE_OPTIONS="--max-old-space-size=512"
```

2. **PM2 Configuration**
```javascript
{
  "instances": 1,
  "max_memory_restart": "512M"
}
```

3. **Next.js Optimizations**
```javascript
// next.config.js
{
  images: { unoptimized: true },
  compress: true,
  output: 'standalone'
}
```

### Monitoramento

```bash
# Ver status dos processos
pm2 status

# Monitorar recursos
pm2 monit

# Ver logs
pm2 logs mali-s

# Restart aplicação
pm2 restart mali-s
```

## 📊 Estrutura do Banco de Dados

### Tabelas Principais

- **clientes**: Dados dos clientes
- **funcionarios**: Dados dos funcionários e horários
- **servicos**: Catálogo de serviços
- **agendamentos**: Registro de agendamentos

### Relacionamentos

- Cliente → Agendamentos (1:N)
- Funcionário → Agendamentos (1:N)  
- Serviço → Agendamentos (1:N)

## 🔧 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev          # Iniciar em desenvolvimento
npm run build        # Build para produção
npm run start        # Iniciar em produção
npm run lint         # Verificar código

# Banco de dados
npm run db:generate  # Gerar Prisma client
npm run db:push      # Aplicar schema
npm run db:studio    # Abrir Prisma Studio
npm run db:seed      # Popular banco
```

## 🔒 Segurança

### Configurações Implementadas

- Rate limiting nas APIs
- Validação de dados com Zod
- Headers de segurança (CSP, XSS, etc.)
- Firewall configurado
- SSL/HTTPS obrigatório

### Variáveis de Ambiente

Copie `.env.example` para `.env` e configure:

```env
NODE_ENV=production
DATABASE_URL="file:./data/salon.db"
NEXTAUTH_SECRET="seu-secret-muito-seguro-aqui"
NEXTAUTH_URL="https://seu-dominio.com"
```

## 📱 Interface do Usuário

### Componentes Principais

- **Dashboard**: Visão geral e estatísticas
- **Sidebar**: Navegação principal
- **Tabelas**: Listagem de dados com paginação
- **Formulários**: Criação e edição de registros
- **Calendário**: Visualização de agendamentos

### Responsividade

- Mobile-first design
- Breakpoints configurados
- Touch-friendly interface

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para detalhes.

## 📞 Suporte

Para suporte e dúvidas:
- Abra uma issue no GitHub
- Email: suporte@mali-s.com

---

Desenvolvido com ❤️ para salões de beleza