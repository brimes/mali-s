import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { servicoSchema } from '@/lib/validations'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const servico = await prisma.servico.findFirst({
      where: {
        id: params.id,
        companyId
      },
      include: {
        agendamentos: {
          include: {
            cliente: {
              select: {
                nome: true
              }
            },
            funcionario: {
              select: {
                nome: true
              }
            }
          },
          orderBy: {
            dataHora: 'desc'
          }
        }
      }
    })

    if (!servico) {
      return NextResponse.json({ error: 'Serviço não encontrado' }, { status: 404 })
    }

    return NextResponse.json(servico)

  } catch (error) {
    console.error('Erro ao buscar serviço:', error)
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

    const body = await request.json()
    const validatedData = servicoSchema.parse(body)

    const servico = await prisma.servico.findFirst({
      where: {
        id: params.id,
        companyId
      }
    })

    if (!servico) {
      return NextResponse.json({ error: 'Serviço não encontrado' }, { status: 404 })
    }

    const updatedServico = await prisma.servico.update({
      where: { id: params.id },
      data: {
        nome: validatedData.nome,
        descricao: validatedData.descricao || null,
        duracao: validatedData.duracao,
        preco: validatedData.preco,
        categoria: validatedData.categoria,
        ativo: validatedData.ativo,
      }
    })

    return NextResponse.json(updatedServico)

  } catch (error) {
    console.error('Erro ao atualizar serviço:', error)
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

    const servico = await prisma.servico.findFirst({
      where: {
        id: params.id,
        companyId
      },
      include: {
        agendamentos: true
      }
    })

    if (!servico) {
      return NextResponse.json({ error: 'Serviço não encontrado' }, { status: 404 })
    }

    // Verificar se há agendamentos não cancelados
    const agendamentosAtivos = servico.agendamentos.filter(a => a.status !== 'cancelado')
    if (agendamentosAtivos.length > 0) {
      return NextResponse.json(
        { error: 'Não é possível excluir um serviço com agendamentos ativos' },
        { status: 400 }
      )
    }

    await prisma.servico.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Erro ao deletar serviço:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}