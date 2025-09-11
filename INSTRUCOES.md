# 🎯 INSTRUÇÕES DE USO - Mali-S

## 🚀 Como Usar o Sistema

### 1. **Acesso ao Sistema**
- Abra seu navegador e acesse: `http://localhost:3000`
- Você será redirecionado automaticamente para o Dashboard

### 2. **Navegação Principal**

#### 📊 **Dashboard**
- Visão geral do salão
- Estatísticas importantes (clientes, agendamentos, faturamento)
- Próximos agendamentos
- Ações rápidas para criar registros

#### 👥 **Clientes**
- **Visualizar**: Lista todos os clientes cadastrados
- **Adicionar**: Clique em "Novo Cliente"
- **Editar**: Clique em "Editar" na linha do cliente
- **Detalhes**: Clique em "Ver Detalhes" para histórico

#### 👨‍💼 **Funcionários**
- **Visualizar**: Lista todos os funcionários
- **Adicionar**: Clique em "Novo Funcionário"
- **Configurar**: Defina especialidades, horários e dias de trabalho
- **Status**: Ative/desative funcionários

#### ✂️ **Serviços**
- **Visualizar**: Lista todos os serviços oferecidos
- **Adicionar**: Clique em "Novo Serviço"
- **Configurar**: Defina duração, preço e categoria
- **Organizar**: Agrupe por categorias (cabelo, unha, estética)

#### 📅 **Agendamentos**
- **Visualizar**: Lista todos os agendamentos
- **Adicionar**: Clique em "Novo Agendamento"
- **Status**: Acompanhe agendado/concluído/cancelado
- **Filtrar**: Por data, funcionário ou cliente

#### 📆 **Calendário**
- **Visão Mensal**: Visualize agendamentos por mês
- **Navegação**: Use as setas para mudar de mês
- **Densidade**: Veja quantos agendamentos por dia

### 3. **Fluxo de Trabalho Recomendado**

#### 🏁 **Configuração Inicial**
1. **Cadastre Funcionários** primeiro
   - Defina especialidades de cada um
   - Configure horários de trabalho
   - Selecione dias da semana

2. **Cadastre Serviços**
   - Organize por categorias
   - Defina durações realistas
   - Configure preços atualizados

3. **Cadastre Clientes**
   - Conforme chegam ao salão
   - Mantenha contatos atualizados

#### 📝 **Rotina Diária**
1. **Manhã**: Verificar agendamentos do dia no Dashboard
2. **Durante o dia**: Marcar agendamentos como concluídos
3. **Final do dia**: Verificar próximos agendamentos

#### 📋 **Criando um Agendamento**
1. Acesse "Agendamentos" → "Novo Agendamento"
2. Selecione o **Cliente** (ou cadastre se necessário)
3. Escolha o **Serviço** desejado
4. Selecione o **Funcionário** disponível
5. Defina **Data e Hora**
6. Adicione **Observações** se necessário
7. Salve o agendamento

### 4. **Dicas de Uso**

#### ⚡ **Ações Rápidas**
- Use o Dashboard para acesso rápido às funcionalidades
- Botões "Novo" estão sempre no canto superior direito
- Use "Ver Detalhes" para informações completas

#### 🔍 **Organização**
- **Clientes**: Mantenha telefones atualizados para contato
- **Funcionários**: Atualize especialidades conforme treinamentos
- **Serviços**: Revise preços periodicamente
- **Agendamentos**: Use observações para necessidades especiais

#### 📱 **Responsividade**
- O sistema funciona em desktop, tablet e celular
- Ideal para usar no caixa ou durante atendimento
- Interface touch-friendly para tablets

### 5. **Gestão do Dia a Dia**

#### 📊 **Acompanhamento**
- **Dashboard**: Métricas em tempo real
- **Calendário**: Visão geral da agenda
- **Status**: Controle do andamento dos serviços

#### 🔄 **Atualizações**
- Marque agendamentos como "Concluído" após o atendimento
- Cancele agendamentos quando necessário
- Mantenha dados de clientes atualizados

#### 📈 **Relatórios**
- Verifique faturamento mensal no Dashboard
- Acompanhe número de agendamentos
- Monitore crescimento da base de clientes

### 6. **Suporte e Manutenção**

#### 🛠️ **Backup**
- O banco SQLite fica na pasta `data/`
- Faça backup regular deste arquivo
- Em produção, configure backup automático

#### 🔄 **Updates**
- Sistema preparado para atualizações
- Dados são preservados entre versões
- Migrations automáticas do banco

#### 📞 **Suporte**
- Documentação completa no README.md
- Logs disponíveis para troubleshooting
- Interface intuitiva e autoexplicativa

---

## 🎉 Pronto para Usar!

O **Mali-S** está configurado e pronto para gerenciar seu salão de beleza de forma profissional e eficiente. 

Comece cadastrando seus funcionários e serviços, e em poucos minutos estará agendando seus primeiros clientes!

**Dica**: Explore todas as funcionalidades gradualmente. O sistema foi projetado para ser intuitivo e fácil de usar.