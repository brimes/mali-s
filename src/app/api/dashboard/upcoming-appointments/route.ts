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

    // Buscar os próximos 3 agendamentos
    const agora = new Date()
    
    const proximosAgendamentos = await prisma.agendamento.findMany({
      where: {
        companyId,
        dataHora: {
          gte: agora
        },
        status: { not: 'cancelado' }
      },
      include: {
        cliente: true,
        funcionario: true,
        servico: true
      },
      orderBy: {
        dataHora: 'asc'
      },
      take: 3
    })

    // Calcular tempo restante para cada agendamento
    const agendamentosComTempo = proximosAgendamentos.map(agendamento => {
      const dataHora = new Date(agendamento.dataHora)
      const agora = new Date()
      const diffMs = dataHora.getTime() - agora.getTime()
      
      let tempoRestante = ''
      
      if (diffMs > 0) {
        const diffMinutos = Math.floor(diffMs / (1000 * 60))
        const diffHoras = Math.floor(diffMinutos / 60)
        const diffDias = Math.floor(diffHoras / 24)
        
        if (diffDias > 0) {
          tempoRestante = `${diffDias}d ${diffHoras % 24}h`
        } else if (diffHoras > 0) {
          tempoRestante = `${diffHoras}h ${diffMinutos % 60}m`
        } else {
          tempoRestante = `${diffMinutos}m`
        }
      } else {
        tempoRestante = 'Agora'
      }

      return {
        id: agendamento.id,
        cliente: agendamento.cliente.nome,
        funcionario: agendamento.funcionario.nome,
        servico: agendamento.servico.nome,
        dataHora: agendamento.dataHora,
        horario: dataHora.toLocaleTimeString('pt-BR', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        status: agendamento.status,
        tempoRestante
      }
    })

    return NextResponse.json(agendamentosComTempo)

  } catch (error) {
    console.error('Erro ao buscar próximos agendamentos:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}