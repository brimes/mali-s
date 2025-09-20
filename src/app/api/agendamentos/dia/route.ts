import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const data = searchParams.get('data')
    const pagina = parseInt(searchParams.get('pagina') || '1')
    const limite = 6

    if (!data) {
      return NextResponse.json(
        { error: 'Data é obrigatória' },
        { status: 400 }
      )
    }

    const startDate = new Date(data)
    const endDate = new Date(data)
    endDate.setDate(endDate.getDate() + 1)

    // Primeiro, buscar todos os funcionários da empresa
    const todosFuncionarios = await prisma.funcionario.findMany({
      where: {
        companyId: companyId
      },
      select: {
        id: true,
        nome: true
      },
      orderBy: {
        nome: 'asc'
      }
    })

    // Buscar agendamentos do dia
    const agendamentosDoDia = await prisma.agendamento.findMany({
      where: {
        companyId: companyId,
        dataHora: {
          gte: startDate,
          lt: endDate
        }
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
      },
      orderBy: {
        dataHora: 'asc'
      }
    })

    // Separar funcionários: primeiro os que têm agendamentos, depois os que não têm
    const funcionariosComAgendamentos = new Set(
      agendamentosDoDia.map(ag => ag.funcionario.id)
    )

    const funcionariosComAgendamentosOrdenados = todosFuncionarios.filter(
      func => funcionariosComAgendamentos.has(func.id)
    )

    const funcionariosSemAgendamentos = todosFuncionarios.filter(
      func => !funcionariosComAgendamentos.has(func.id)
    )

    // Combinar: primeiro os com agendamentos, depois os sem
    const funcionariosOrdenados = [
      ...funcionariosComAgendamentosOrdenados,
      ...funcionariosSemAgendamentos
    ]

    // Aplicar paginação
    const offset = (pagina - 1) * limite
    const funcionariosPaginados = funcionariosOrdenados.slice(offset, offset + limite)

    // Calcular informações de paginação
    const totalFuncionarios = funcionariosOrdenados.length
    const totalPaginas = Math.ceil(totalFuncionarios / limite)
    const temProximaPagina = pagina < totalPaginas
    const temPaginaAnterior = pagina > 1

    return NextResponse.json({
      funcionarios: funcionariosPaginados,
      agendamentos: agendamentosDoDia,
      paginacao: {
        paginaAtual: pagina,
        totalPaginas,
        totalFuncionarios,
        funcionariosPorPagina: limite,
        temProximaPagina,
        temPaginaAnterior
      }
    })
  } catch (error) {
    console.error('Erro ao buscar dados do dia:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}