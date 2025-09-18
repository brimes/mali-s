import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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

    const cliente = await prisma.cliente.findFirst({
      where: {
        id: params.id,
        companyId
      },
      include: {
        agendamentos: {
          include: {
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

    if (!cliente) {
      return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 })
    }

    return NextResponse.json(cliente)

  } catch (error) {
    console.error('Erro ao buscar cliente:', error)
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

    const cliente = await prisma.cliente.findFirst({
      where: {
        id: params.id,
        companyId
      }
    })

    if (!cliente) {
      return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 })
    }

    const updatedCliente = await prisma.cliente.update({
      where: { id: params.id },
      data: {
        nome: body.nome,
        telefone: body.telefone,
        email: body.email || null,
        observacoes: body.observacoes || null,
      }
    })

    return NextResponse.json(updatedCliente)

  } catch (error) {
    console.error('Erro ao atualizar cliente:', error)
    
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { error: 'Telefone já cadastrado para outro cliente' },
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

    const cliente = await prisma.cliente.findFirst({
      where: {
        id: params.id,
        companyId
      }
    })

    if (!cliente) {
      return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 })
    }

    await prisma.cliente.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Erro ao deletar cliente:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}