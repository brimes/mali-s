import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...')

  // Buscar a primeira empresa para associar os dados
  const company = await prisma.company.findFirst()
  
  if (!company) {
    console.log('❌ Nenhuma empresa encontrada. Execute primeiro o seed-auth.ts')
    return
  }

  // Limpar dados existentes
  await prisma.agendamento.deleteMany()
  await prisma.cliente.deleteMany()
  await prisma.funcionario.deleteMany()
  await prisma.servico.deleteMany()

  // Criar clientes
  const clientes = await Promise.all([
    prisma.cliente.create({
      data: {
        nome: 'Maria Silva',
        telefone: '11999999999',
        email: 'maria@email.com',
        observacoes: 'Cliente preferencial',
        companyId: company.id
      }
    }),
    prisma.cliente.create({
      data: {
        nome: 'João Santos',
        telefone: '11888888888',
        email: 'joao@email.com',
        companyId: company.id
      }
    }),
    prisma.cliente.create({
      data: {
        nome: 'Ana Paula',
        telefone: '11777777777',
        email: 'ana@email.com',
        companyId: company.id
      }
    })
  ])

  console.log(`✅ Criados ${clientes.length} clientes`)

  // Criar funcionários
  const funcionarios = await Promise.all([
    prisma.funcionario.create({
      data: {
        nome: 'Ana Costa',
        telefone: '11111111111',
        especialidades: JSON.stringify(['corte', 'pintura', 'tratamento']),
        horarioInicio: '08:00',
        horarioFim: '18:00',
        diasTrabalho: JSON.stringify(['segunda', 'terca', 'quarta', 'quinta', 'sexta']),
        companyId: company.id
      }
    }),
    prisma.funcionario.create({
      data: {
        nome: 'Carla Lima',
        telefone: '11222222222',
        especialidades: JSON.stringify(['manicure', 'pedicure', 'sobrancelha']),
        horarioInicio: '09:00',
        horarioFim: '17:00',
        diasTrabalho: JSON.stringify(['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado']),
        companyId: company.id
      }
    }),
    prisma.funcionario.create({
      data: {
        nome: 'Fernanda Rocha',
        telefone: '11333333333',
        especialidades: JSON.stringify(['corte', 'penteado', 'maquiagem']),
        horarioInicio: '10:00',
        horarioFim: '19:00',
        diasTrabalho: JSON.stringify(['terca', 'quarta', 'quinta', 'sexta', 'sabado']),
        companyId: company.id
      }
    })
  ])

  console.log(`✅ Criados ${funcionarios.length} funcionários`)

  // Criar serviços
  const servicos = await Promise.all([
    prisma.servico.create({
      data: {
        nome: 'Corte Feminino',
        descricao: 'Corte de cabelo feminino',
        duracao: 60,
        preco: 45.00,
        categoria: 'cabelo',
        companyId: company.id
      }
    }),
    prisma.servico.create({
      data: {
        nome: 'Corte Masculino',
        descricao: 'Corte de cabelo masculino',
        duracao: 30,
        preco: 25.00,
        categoria: 'cabelo',
        companyId: company.id
      }
    }),
    prisma.servico.create({
      data: {
        nome: 'Escova',
        descricao: 'Escova modeladora',
        duracao: 45,
        preco: 35.00,
        categoria: 'cabelo',
        companyId: company.id
      }
    }),
    prisma.servico.create({
      data: {
        nome: 'Pintura Completa',
        descricao: 'Coloração completa do cabelo',
        duracao: 120,
        preco: 80.00,
        categoria: 'cabelo',
        companyId: company.id
      }
    }),
    prisma.servico.create({
      data: {
        nome: 'Manicure',
        descricao: 'Cuidados com as unhas das mãos',
        duracao: 45,
        preco: 20.00,
        categoria: 'unha',
        companyId: company.id
      }
    }),
    prisma.servico.create({
      data: {
        nome: 'Pedicure',
        descricao: 'Cuidados com as unhas dos pés',
        duracao: 60,
        preco: 25.00,
        categoria: 'unha',
        companyId: company.id
      }
    }),
    prisma.servico.create({
      data: {
        nome: 'Design de Sobrancelha',
        descricao: 'Modelagem e design de sobrancelhas',
        duracao: 30,
        preco: 15.00,
        categoria: 'sobrancelha',
        companyId: company.id
      }
    })
  ])

  console.log(`✅ Criados ${servicos.length} serviços`)

  // Criar alguns agendamentos de exemplo
  const agendamentos = await Promise.all([
    prisma.agendamento.create({
      data: {
        dataHora: new Date(2024, 10, 15, 14, 0), // 15/11/2024 14:00
        clienteId: clientes[0].id,
        funcionarioId: funcionarios[0].id,
        servicoId: servicos[0].id,
        status: 'agendado',
        companyId: company.id
      }
    }),
    prisma.agendamento.create({
      data: {
        dataHora: new Date(2024, 10, 15, 15, 30), // 15/11/2024 15:30
        clienteId: clientes[1].id,
        funcionarioId: funcionarios[1].id,
        servicoId: servicos[4].id,
        status: 'agendado',
        companyId: company.id
      }
    }),
    prisma.agendamento.create({
      data: {
        dataHora: new Date(2024, 10, 14, 16, 0), // 14/11/2024 16:00
        clienteId: clientes[2].id,
        funcionarioId: funcionarios[2].id,
        servicoId: servicos[6].id,
        status: 'concluido',
        companyId: company.id
      }
    })
  ])

  console.log(`✅ Criados ${agendamentos.length} agendamentos`)

  console.log('🎉 Seed completado com sucesso!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })