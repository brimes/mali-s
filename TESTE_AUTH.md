# Guia de Teste - Sistema de Autenticação Mali-S

## 🔐 Teste de Autenticação

### 1. Testando Proteção de Rotas

**Teste 1: Acesso Direto ao Dashboard (SEM Login)**
- Acesse: `http://localhost:3000/dashboard`
- ✅ **Resultado Esperado**: Deve redirecionar para `/login`

**Teste 2: Acesso à Página Inicial**
- Acesse: `http://localhost:3000`
- ✅ **Resultado Esperado**: Deve redirecionar para `/login`

**Teste 3: Acesso Direto às Páginas do Sistema (SEM Login)**
- Acesse: `http://localhost:3000/clientes`
- Acesse: `http://localhost:3000/agendamentos`
- ✅ **Resultado Esperado**: Ambas devem redirecionar para `/login`

### 2. Testando Login

**Usuários de Teste Disponíveis:**

1. **Administrador Geral**
   - Email: `admin@sistema.com`
   - Senha: `123456`
   - Acesso: Sistema completo

2. **Gerente de Rede**
   - Email: `gerente@belezatotal.com`
   - Senha: `123456`
   - Acesso: Todas as lojas da rede

3. **Gerente de Loja**
   - Email: `gerente.centro@belezatotal.com`
   - Senha: `123456`
   - Acesso: Loja específica

4. **Funcionário**
   - Email: `maria@belezatotal.com`
   - Senha: `123456`
   - Acesso: Loja específica (limitado)

### 3. Testando Funcionalidades Pós-Login

**Teste 4: Login Bem-sucedido**
1. Acesse: `http://localhost:3000/login`
2. Use qualquer usuário de teste acima
3. ✅ **Resultado Esperado**: Redirecionar para `/dashboard`

**Teste 5: Acesso Após Login**
1. Faça login com qualquer usuário
2. Acesse: `http://localhost:3000/dashboard`
3. ✅ **Resultado Esperado**: Deve mostrar o dashboard com informações do usuário

**Teste 6: Tentativa de Acesso ao Login Quando Já Logado**
1. Estando logado, acesse: `http://localhost:3000/login`
2. ✅ **Resultado Esperado**: Deve redirecionar para `/dashboard`

**Teste 7: Informações do Usuário na Sidebar**
1. Estando logado, verificar a sidebar
2. ✅ **Resultado Esperado**: 
   - Nome do usuário
   - Tipo de usuário (Admin, Gerente de Rede, etc.)
   - Empresa/Grupo associado
   - Botão de logout

**Teste 8: Logout**
1. Clique no menu do usuário na sidebar
2. Clique em "Sair"
3. ✅ **Resultado Esperado**: Redirecionar para `/login`

### 4. Testando Controle de Acesso por Tipo de Usuário

**Teste 9: Acesso de Admin**
- Login: `admin@sistema.com`
- ✅ **Resultado Esperado**: Acesso ao dashboard com painel administrativo especial

**Teste 10: Acesso de Funcionário**
- Login: `maria@belezatotal.com`
- ✅ **Resultado Esperado**: Acesso ao dashboard padrão (sem painel admin)

## 🚀 Executando os Testes

1. **Inicie o servidor:**
   ```bash
   npm run dev
   ```

2. **Acesse:** http://localhost:3000

3. **Execute cada teste sequencialmente**

4. **Problemas?**
   - Verifique se o banco foi populado: `npx tsx prisma/seed-auth.ts`
   - Verifique se as dependências estão instaladas: `npm install`
   - Verifique o console do navegador para erros JavaScript

## 🔧 Comandos Úteis para Debug

```bash
# Verificar logs do servidor
npm run dev

# Popular banco novamente se necessário
npx tsx prisma/seed-auth.ts

# Verificar estrutura do banco
npx prisma studio
```

## ✅ Checklist de Funcionalidades

- [ ] Redirecionamento para login quando não autenticado
- [ ] Login funcional com usuários de teste
- [ ] Redirecionamento para dashboard após login
- [ ] Informações do usuário na sidebar
- [ ] Logout funcional
- [ ] Proteção de rotas baseada em autenticação
- [ ] Controle de acesso baseado em tipo de usuário