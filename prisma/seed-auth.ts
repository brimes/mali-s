import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Criando dados iniciais...')

  // Criar grupo de empresas
  const companyGroup = await prisma.companyGroup.create({
    data: {
      name: 'Rede Beleza Total',
      description: 'Rede de salões de beleza com várias unidades'
    }
  })

  // Criar empresas
  const company1 = await prisma.company.create({
    data: {
      name: 'Beleza Total - Centro',
      cnpj: '12.345.678/0001-00',
      phone: '(11) 3333-3333',
      email: 'centro@belezatotal.com',
      address: 'Rua das Flores, 123',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01000-000',
      companyGroupId: companyGroup.id
    }
  })

  const company2 = await prisma.company.create({
    data: {
      name: 'Beleza Total - Shopping',
      cnpj: '12.345.678/0002-00',
      phone: '(11) 4444-4444',
      email: 'shopping@belezatotal.com',
      address: 'Shopping Center, Loja 123',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '02000-000',
      companyGroupId: companyGroup.id
    }
  })

  // Criar usuários
  const hashedPassword = await bcrypt.hash('123456', 12)

  const admin = await prisma.user.create({
    data: {
      name: 'Administrador Geral',
      email: 'admin@sistema.com',
      phone: '(11) 99999-9999',
      password: hashedPassword,
      userType: 'ADMIN'
    }
  })

  const groupManager = await prisma.user.create({
    data: {
      name: 'Gerente da Rede',
      email: 'gerente@belezatotal.com',
      phone: '(11) 88888-8888',
      password: hashedPassword,
      userType: 'COMPANY_GROUP',
      companyGroupId: companyGroup.id
    }
  })

  const companyManager1 = await prisma.user.create({
    data: {
      name: 'Gerente Centro',
      email: 'gerente.centro@belezatotal.com',
      phone: '(11) 77777-7777',
      password: hashedPassword,
      userType: 'COMPANY',
      companyId: company1.id
    }
  })

  const employee1 = await prisma.user.create({
    data: {
      name: 'Maria Silva',
      email: 'maria@belezatotal.com',
      phone: '(11) 66666-6666',
      password: hashedPassword,
      userType: 'EMPLOYEE',
      companyId: company1.id
    }
  })

  // Criar clientes de exemplo
  await prisma.cliente.createMany({
    data: [
      {
        nome: 'Ana Santos',
        telefone: '(11) 91111-1111',
        email: 'ana@email.com',
        observacoes: 'Prefere horários pela manhã',
        companyId: company1.id
      },
      {
        nome: 'Carla Lima',
        telefone: '(11) 92222-2222',
        email: 'carla@email.com',
        observacoes: 'Cliente VIP',
        companyId: company1.id
      },
      {
        nome: 'Beatriz Costa',
        telefone: '(11) 93333-3333',
        email: 'beatriz@email.com',
        companyId: company2.id
      }
    ]
  })

  // Criar funcionários de exemplo
  await prisma.funcionario.createMany({
    data: [
      {
        nome: 'João Cabeleireiro',
        telefone: '(11) 94444-4444',
        especialidades: JSON.stringify(['corte', 'pintura', 'escova']),
        horarioInicio: '08:00',
        horarioFim: '18:00',
        diasTrabalho: JSON.stringify(['segunda', 'terca', 'quarta', 'quinta', 'sexta']),
        companyId: company1.id
      },
      {
        nome: 'Maria Manicure',
        telefone: '(11) 95555-5555',
        especialidades: JSON.stringify(['manicure', 'pedicure', 'nail art']),
        horarioInicio: '09:00',
        horarioFim: '17:00',
        diasTrabalho: JSON.stringify(['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado']),
        companyId: company1.id
      },
      {
        nome: 'Pedro Barbeiro',
        telefone: '(11) 96666-6666',
        especialidades: JSON.stringify(['corte masculino', 'barba', 'bigode']),
        horarioInicio: '08:00',
        horarioFim: '19:00',
        diasTrabalho: JSON.stringify(['terca', 'quarta', 'quinta', 'sexta', 'sabado']),
        companyId: company2.id
      }
    ]
  })

  // Criar serviços de exemplo
  await prisma.servico.createMany({
    data: [
      {
        nome: 'Corte Feminino',
        descricao: 'Corte e finalização',
        duracao: 60,
        preco: 50.0,
        categoria: 'cabelo',
        companyId: company1.id
      },
      {
        nome: 'Pintura Completa',
        descricao: 'Coloração completa dos cabelos',
        duracao: 120,
        preco: 120.0,
        categoria: 'cabelo',
        companyId: company1.id
      },
      {
        nome: 'Manicure',
        descricao: 'Cuidados com as unhas das mãos',
        duracao: 45,
        preco: 25.0,
        categoria: 'unha',
        companyId: company1.id
      },
      {
        nome: 'Pedicure',
        descricao: 'Cuidados com as unhas dos pés',
        duracao: 60,
        preco: 35.0,
        categoria: 'unha',
        companyId: company1.id
      },
      {
        nome: 'Corte Masculino',
        descricao: 'Corte masculino tradicional',
        duracao: 30,
        preco: 25.0,
        categoria: 'cabelo',
        companyId: company2.id
      },
      {
        nome: 'Barba',
        descricao: 'Aparar e modelar a barba',
        duracao: 20,
        preco: 15.0,
        categoria: 'barba',
        companyId: company2.id
      },
      {
        nome: 'Escova Progressiva',
        descricao: 'Alisamento e hidratação',
        duracao: 180,
        preco: 200.0,
        categoria: 'cabelo',
        companyId: company1.id
      }
    ]
  })

  console.log('✅ Dados iniciais criados com sucesso!')
  console.log('👤 Usuários criados:')
  console.log('   - Admin: admin@sistema.com (senha: 123456)')
  console.log('   - Gerente Rede: gerente@belezatotal.com (senha: 123456)')
  console.log('   - Gerente Loja: gerente.centro@belezatotal.com (senha: 123456)')
  console.log('   - Funcionário: maria@belezatotal.com (senha: 123456)')
}

main()
  .catch((e) => {
    console.error('❌ Erro ao criar dados iniciais:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })