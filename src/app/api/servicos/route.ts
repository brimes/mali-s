import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { servicoSchema } from '@/lib/validations'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET() {
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

    const servicos = await prisma.servico.findMany({
      where: { companyId },
      include: {
        agendamentos: true
      },
      orderBy: {
        categoria: 'asc'
      }
    })

    return NextResponse.json(servicos)
  } catch (error) {
    console.error('Erro ao buscar serviços:', error)
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
    const validatedData = servicoSchema.parse(body)

    const servico = await prisma.servico.create({
      data: {
        nome: validatedData.nome,
        descricao: validatedData.descricao || null,
        duracao: validatedData.duracao,
        preco: validatedData.preco,
        categoria: validatedData.categoria,
        ativo: validatedData.ativo,
        companyId: companyId
      }
    })

    return NextResponse.json(servico, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar serviço:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}