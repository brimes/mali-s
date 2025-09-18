import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Obter o companyId do usuário
    let companyId = session.user.companyId

    // Admins/Gerentes de grupo obtêm acesso de fallback à empresa
    if (!companyId && (session.user.userType === 'ADMIN' || session.user.userType === 'COMPANY_GROUP')) {
      const firstCompany = await prisma.company.findFirst({
        where: session.user.userType === 'COMPANY_GROUP' 
          ? { companyGroupId: session.user.companyGroupId }
          : undefined
      })
      companyId = firstCompany?.id
    }

    if (!companyId) {
      return NextResponse.json({ error: 'Empresa não encontrada' }, { status: 404 })
    }

    // Buscar total de clientes
    const totalClientes = await prisma.cliente.count({
      where: { companyId }
    })

    // Buscar agendamentos de hoje
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)
    const amanha = new Date(hoje)
    amanha.setDate(amanha.getDate() + 1)

    const agendamentosHoje = await prisma.agendamento.count({
      where: {
        companyId,
        dataHora: {
          gte: hoje,
          lt: amanha
        },
        status: { not: 'cancelado' }
      }
    })

    // Buscar total de serviços ativos
    const totalServicos = await prisma.servico.count({
      where: {
        companyId,
        ativo: true
      }
    })

    // Buscar faturamento do mês atual
    const inicioMes = new Date()
    inicioMes.setDate(1)
    inicioMes.setHours(0, 0, 0, 0)

    const agendamentosConcluidos = await prisma.agendamento.findMany({
      where: {
        companyId,
        status: 'concluido',
        dataHora: {
          gte: inicioMes
        }
      },
      include: {
        servico: true
      }
    })

    // Calcular faturamento (usar preço do agendamento se existir, senão usar preço do serviço)
    const faturamentoMes = agendamentosConcluidos.reduce((total, agendamento) => {
      const preco = agendamento.preco || agendamento.servico.preco
      return total + preco
    }, 0)

    const stats = {
      totalClientes,
      agendamentosHoje,
      totalServicos,
      faturamentoMes
    }

    return NextResponse.json(stats)

  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}