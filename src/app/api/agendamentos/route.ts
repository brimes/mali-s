import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { agendamentoSchema } from '@/lib/validations'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const data = searchParams.get('data')
    const funcionarioId = searchParams.get('funcionarioId')

    let whereClause = {}

    if (data) {
      const startDate = new Date(data)
      const endDate = new Date(data)
      endDate.setDate(endDate.getDate() + 1)

      whereClause = {
        ...whereClause,
        dataHora: {
          gte: startDate,
          lt: endDate
        }
      }
    }

    if (funcionarioId) {
      whereClause = {
        ...whereClause,
        funcionarioId
      }
    }

    const agendamentos = await prisma.agendamento.findMany({
      where: whereClause,
      include: {
        cliente: true,
        funcionario: true,
        servico: true
      },
      orderBy: {
        dataHora: 'asc'
      }
    })

    return NextResponse.json(agendamentos)
  } catch (error) {
    console.error('Erro ao buscar agendamentos:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 401 }
      )
    }

    // Obter companyId do usuário logado
    let companyId = session.user.companyId
    
    // Se for admin ou gerente de rede, usar a primeira empresa encontrada
    if (!companyId && (session.user.userType === 'ADMIN' || session.user.userType === 'COMPANY_GROUP')) {
      const firstCompany = await prisma.company.findFirst()
      companyId = firstCompany?.id
    }

    if (!companyId) {
      return NextResponse.json(
        { error: 'Empresa não encontrada' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const validatedData = agendamentoSchema.parse(body)

    // Verificar disponibilidade do funcionário
    const conflito = await prisma.agendamento.findFirst({
      where: {
        funcionarioId: validatedData.funcionarioId,
        dataHora: validatedData.dataHora,
        status: {
          not: 'cancelado'
        }
      }
    })

    if (conflito) {
      return NextResponse.json(
        { error: 'Funcionário não disponível neste horário' },
        { status: 400 }
      )
    }

    const agendamento = await prisma.agendamento.create({
      data: {
        dataHora: validatedData.dataHora,
        clienteId: validatedData.clienteId,
        funcionarioId: validatedData.funcionarioId,
        servicoId: validatedData.servicoId,
        status: validatedData.status,
        observacoes: validatedData.observacoes || null,
        preco: validatedData.preco || null,
        companyId: companyId
      },
      include: {
        cliente: true,
        funcionario: true,
        servico: true
      }
    })

    return NextResponse.json(agendamento, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar agendamento:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}