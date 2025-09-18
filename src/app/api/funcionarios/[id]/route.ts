import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { funcionarioSchema } from '@/lib/validations'

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

    const funcionario = await prisma.funcionario.findFirst({
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
            servico: {
              select: {
                nome: true,
                preco: true
              }
            }
          },
          orderBy: {
            dataHora: 'desc'
          }
        }
      }
    })

    if (!funcionario) {
      return NextResponse.json({ error: 'Funcionário não encontrado' }, { status: 404 })
    }

    // Converter especialidades e diasTrabalho de JSON string para array
    const funcionarioFormatted = {
      ...funcionario,
      especialidades: JSON.parse(funcionario.especialidades),
      diasTrabalho: JSON.parse(funcionario.diasTrabalho)
    }

    return NextResponse.json(funcionarioFormatted)

  } catch (error) {
    console.error('Erro ao buscar funcionário:', error)
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
    const validatedData = funcionarioSchema.parse(body)

    const funcionario = await prisma.funcionario.findFirst({
      where: {
        id: params.id,
        companyId
      }
    })

    if (!funcionario) {
      return NextResponse.json({ error: 'Funcionário não encontrado' }, { status: 404 })
    }

    const updatedFuncionario = await prisma.funcionario.update({
      where: { id: params.id },
      data: {
        nome: validatedData.nome,
        telefone: validatedData.telefone,
        especialidades: JSON.stringify(validatedData.especialidades),
        horarioInicio: validatedData.horarioInicio,
        horarioFim: validatedData.horarioFim,
        diasTrabalho: JSON.stringify(validatedData.diasTrabalho),
        ativo: validatedData.ativo,
      }
    })

    return NextResponse.json({
      ...updatedFuncionario,
      especialidades: JSON.parse(updatedFuncionario.especialidades),
      diasTrabalho: JSON.parse(updatedFuncionario.diasTrabalho)
    })

  } catch (error) {
    console.error('Erro ao atualizar funcionário:', error)
    
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { error: 'Telefone já cadastrado para outro funcionário' },
        { status: 400 }
      )
    }

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

    const funcionario = await prisma.funcionario.findFirst({
      where: {
        id: params.id,
        companyId
      },
      include: {
        agendamentos: true
      }
    })

    if (!funcionario) {
      return NextResponse.json({ error: 'Funcionário não encontrado' }, { status: 404 })
    }

    // Verificar se há agendamentos não cancelados
    const agendamentosAtivos = funcionario.agendamentos.filter(a => a.status !== 'cancelado')
    if (agendamentosAtivos.length > 0) {
      return NextResponse.json(
        { error: 'Não é possível excluir um funcionário com agendamentos ativos' },
        { status: 400 }
      )
    }

    await prisma.funcionario.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Erro ao deletar funcionário:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}