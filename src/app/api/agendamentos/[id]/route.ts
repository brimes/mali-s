import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const agendamento = await prisma.agendamento.findFirst({
      where: {
        id: params.id,
        companyId: companyId
      },
      include: {
        cliente: {
          select: {
            id: true,
            nome: true,
            telefone: true
          }
        },
        funcionario: {
          select: {
            id: true,
            nome: true
          }
        },
        servico: {
          select: {
            id: true,
            nome: true,
            duracao: true,
            preco: true
          }
        }
      }
    })

    if (!agendamento) {
      return NextResponse.json(
        { error: 'Agendamento não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(agendamento)
  } catch (error) {
    console.error('Erro ao buscar agendamento:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Verificar se o agendamento existe e pertence à empresa
    const agendamento = await prisma.agendamento.findFirst({
      where: {
        id: params.id,
        companyId: companyId
      }
    })

    if (!agendamento) {
      return NextResponse.json(
        { error: 'Agendamento não encontrado' },
        { status: 404 }
      )
    }

    // Excluir o agendamento
    await prisma.agendamento.delete({
      where: {
        id: params.id
      }
    })

    return NextResponse.json(
      { message: 'Agendamento excluído com sucesso' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Erro ao excluir agendamento:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Verificar se o agendamento existe e pertence à empresa
    const agendamentoExistente = await prisma.agendamento.findFirst({
      where: {
        id: params.id,
        companyId: companyId
      }
    })

    if (!agendamentoExistente) {
      return NextResponse.json(
        { error: 'Agendamento não encontrado' },
        { status: 404 }
      )
    }

    // Processar dataHora se fornecida
    let dataHoraProcessada
    if (body.dataHora) {
      if (typeof body.dataHora === 'string') {
        if (!body.dataHora.includes('Z') && !body.dataHora.includes('+') && !body.dataHora.includes('-', 10)) {
          const [datePart, timePart] = body.dataHora.split('T')
          const [year, month, day] = datePart.split('-').map(Number)
          const [hour, minute] = timePart.split(':').map(Number)
          dataHoraProcessada = new Date(Date.UTC(year, month - 1, day, hour, minute, 0, 0))
        } else {
          dataHoraProcessada = new Date(body.dataHora)
        }
      } else {
        dataHoraProcessada = new Date(body.dataHora)
      }
    }

    // Atualizar o agendamento
    const agendamentoAtualizado = await prisma.agendamento.update({
      where: {
        id: params.id
      },
      data: {
        ...(dataHoraProcessada && { dataHora: dataHoraProcessada }),
        ...(body.clienteId && { clienteId: body.clienteId }),
        ...(body.funcionarioId && { funcionarioId: body.funcionarioId }),
        ...(body.servicoId && { servicoId: body.servicoId }),
        ...(body.status && { status: body.status }),
        ...(body.observacoes !== undefined && { observacoes: body.observacoes }),
        ...(body.preco !== undefined && { preco: body.preco })
      },
      include: {
        cliente: true,
        funcionario: true,
        servico: true
      }
    })

    return NextResponse.json(agendamentoAtualizado)
  } catch (error) {
    console.error('Erro ao atualizar agendamento:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}