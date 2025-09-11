import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import bcrypt from 'bcryptjs'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const userType = searchParams.get('userType')
    const companyId = searchParams.get('companyId')
    const companyGroupId = searchParams.get('companyGroupId')
    const active = searchParams.get('active')

    // Construir filtros baseado no tipo de usuário da sessão
    let whereClause: any = {}

    // Se não for ADMIN, aplicar filtros de acesso
    if (session.user.userType !== 'ADMIN') {
      if (session.user.userType === 'COMPANY_GROUP') {
        whereClause.companyGroupId = session.user.companyGroupId
      } else if (session.user.userType === 'COMPANY') {
        whereClause.companyId = session.user.companyId
      } else if (session.user.userType === 'EMPLOYEE') {
        whereClause.companyId = session.user.companyId
        whereClause.id = session.user.id // Funcionário só vê a si mesmo
      }
    }

    // Aplicar filtros adicionais da query
    if (userType) {
      whereClause.userType = userType
    }
    if (companyId) {
      whereClause.companyId = companyId
    }
    if (companyGroupId) {
      whereClause.companyGroupId = companyGroupId
    }
    if (active !== null) {
      whereClause.active = active === 'true'
    }

    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        userType: true,
        active: true,
        photo: true,
        createdAt: true,
        updatedAt: true,
        company: {
          select: {
            id: true,
            name: true
          }
        },
        companyGroup: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: [
        { active: 'desc' },
        { name: 'asc' }
      ]
    })

    return NextResponse.json(users)
  } catch (error) {
    console.error('Erro ao buscar usuários:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    // Apenas admins podem criar usuários
    if (session.user.userType !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const {
      name,
      email,
      phone,
      password,
      userType,
      active,
      companyId,
      companyGroupId
    } = body

    // Validações básicas
    if (!name || !email || !password || !userType) {
      return NextResponse.json(
        { error: 'Nome, email, senha e tipo de usuário são obrigatórios' },
        { status: 400 }
      )
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 12)

    // Preparar dados para criação
    const userData: any = {
      name,
      email,
      password: hashedPassword,
      userType,
      active: active ?? true
    }

    if (phone) userData.phone = phone
    if (companyId) userData.companyId = companyId
    if (companyGroupId) userData.companyGroupId = companyGroupId

    const user = await prisma.user.create({
      data: userData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        userType: true,
        active: true,
        photo: true,
        createdAt: true,
        updatedAt: true,
        company: {
          select: {
            id: true,
            name: true
          }
        },
        companyGroup: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    return NextResponse.json(user, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar usuário:', error)
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { error: 'Email já está em uso' },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}