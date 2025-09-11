import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import bcrypt from 'bcryptjs'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const { id } = params

    // Verificar se o usuário tem permissão para ver este usuário
    let whereClause: any = { id }

    if (session.user.userType !== 'ADMIN') {
      if (session.user.userType === 'COMPANY_GROUP') {
        whereClause.companyGroupId = session.user.companyGroupId
      } else if (session.user.userType === 'COMPANY') {
        whereClause.companyId = session.user.companyId
      } else if (session.user.userType === 'EMPLOYEE') {
        whereClause.id = session.user.id // Funcionário só vê a si mesmo
      }
    }

    const user = await prisma.user.findFirst({
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
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Erro ao buscar usuário:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    // Apenas admins podem editar usuários ou usuários podem editar a si mesmos
    if (session.user.userType !== 'ADMIN' && session.user.id !== params.id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 403 }
      )
    }

    const { id } = params
    const body = await request.json()

    const {
      name,
      email,
      phone,
      password,
      userType,
      active,
      companyId,
      companyGroupId,
      photo
    } = body

    // Preparar dados para atualização
    const updateData: any = {}

    if (name !== undefined) updateData.name = name
    if (email !== undefined) updateData.email = email
    if (phone !== undefined) updateData.phone = phone
    if (userType !== undefined) updateData.userType = userType
    if (active !== undefined) updateData.active = active
    if (companyId !== undefined) updateData.companyId = companyId
    if (companyGroupId !== undefined) updateData.companyGroupId = companyGroupId
    if (photo !== undefined) updateData.photo = photo

    // Se password foi fornecido, hash it
    if (password) {
      updateData.password = await bcrypt.hash(password, 12)
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
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

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error)
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    // Apenas admins podem deletar usuários
    if (session.user.userType !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 403 }
      )
    }

    const { id } = params

    // Verificar se o usuário existe
    const user = await prisma.user.findUnique({
      where: { id }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    // Não permitir deletar o próprio usuário
    if (session.user.id === id) {
      return NextResponse.json(
        { error: 'Não é possível deletar seu próprio usuário' },
        { status: 400 }
      )
    }

    await prisma.user.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao deletar usuário:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}