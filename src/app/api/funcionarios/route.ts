import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { funcionarioSchema } from '@/lib/validations'
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

    const funcionarios = await prisma.funcionario.findMany({
      where: { companyId },
      include: {
        agendamentos: true
      },
      orderBy: {
        nome: 'asc'
      }
    })

    // Converter especialidades e diasTrabalho de JSON string para array
    const funcionariosFormatted = funcionarios.map(funcionario => ({
      ...funcionario,
      especialidades: JSON.parse(funcionario.especialidades),
      diasTrabalho: JSON.parse(funcionario.diasTrabalho)
    }))

    return NextResponse.json(funcionariosFormatted)
  } catch (error) {
    console.error('Erro ao buscar funcionários:', error)
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
    const validatedData = funcionarioSchema.parse(body)

    const funcionario = await prisma.funcionario.create({
      data: {
        nome: validatedData.nome,
        telefone: validatedData.telefone,
        especialidades: JSON.stringify(validatedData.especialidades),
        horarioInicio: validatedData.horarioInicio,
        horarioFim: validatedData.horarioFim,
        diasTrabalho: JSON.stringify(validatedData.diasTrabalho),
        ativo: validatedData.ativo,
        companyId: companyId
      }
    })

    return NextResponse.json({
      ...funcionario,
      especialidades: JSON.parse(funcionario.especialidades),
      diasTrabalho: JSON.parse(funcionario.diasTrabalho)
    }, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar funcionário:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}