import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    // Verificar token de inicialização
    const authHeader = request.headers.get('authorization')
    const expectedToken = process.env.INIT_ADMIN_TOKEN
    
    if (!expectedToken) {
      return NextResponse.json(
        { error: 'Token de inicialização não configurado no servidor' },
        { status: 500 }
      )
    }
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Token de autorização obrigatório' },
        { status: 401 }
      )
    }
    
    const token = authHeader.substring(7)
    if (token !== expectedToken) {
      return NextResponse.json(
        { error: 'Token de autorização inválido' },
        { status: 401 }
      )
    }

    // Verificar se já existe um admin
    const existingAdmin = await prisma.user.findFirst({
      where: {
        userType: 'ADMIN'
      }
    })

    if (existingAdmin) {
      return NextResponse.json({
        message: 'Admin já existe',
        admin: {
          id: existingAdmin.id,
          name: existingAdmin.name,
          email: existingAdmin.email,
          userType: existingAdmin.userType,
          createdAt: existingAdmin.createdAt
        }
      })
    }

    // Executar DB push para garantir que o schema está criado
    const { execSync } = require('child_process')
    try {
      execSync('npx prisma db push', { stdio: 'pipe' })
    } catch (error) {
      console.warn('Aviso: Erro ao executar db push:', error)
      // Continuar mesmo com erro, pois o banco pode já existir
    }

    // Criar admin padrão
    const hashedPassword = await bcrypt.hash('Mali#2024@Admin!', 12)
    
    const adminUser = await prisma.user.create({
      data: {
        name: 'Administrador do Sistema',
        email: 'admin@mali-s.com',
        password: hashedPassword,
        userType: 'ADMIN',
        active: true,
        phone: '(00) 00000-0000',
      }
    })

    return NextResponse.json({
      message: 'Admin criado com sucesso',
      admin: {
        id: adminUser.id,
        name: adminUser.name,
        email: adminUser.email,
        userType: adminUser.userType,
        createdAt: adminUser.createdAt
      },
      credentials: {
        email: 'admin@mali-s.com',
        password: 'Mali#2024@Admin!',
        warning: 'IMPORTANTE: Altere a senha após o primeiro login!'
      }
    })

  } catch (error) {
    console.error('Erro ao criar admin:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error instanceof Error ? error.message : 'Erro desconhecido' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verificar token de inicialização
    const authHeader = request.headers.get('authorization')
    const expectedToken = process.env.INIT_ADMIN_TOKEN
    
    if (!expectedToken) {
      return NextResponse.json(
        { error: 'Token de inicialização não configurado no servidor' },
        { status: 500 }
      )
    }
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Token de autorização obrigatório' },
        { status: 401 }
      )
    }
    
    const token = authHeader.substring(7)
    if (token !== expectedToken) {
      return NextResponse.json(
        { error: 'Token de autorização inválido' },
        { status: 401 }
      )
    }

    // Verificar status do admin
    const admins = await prisma.user.findMany({
      where: {
        userType: 'ADMIN'
      },
      select: {
        id: true,
        name: true,
        email: true,
        userType: true,
        active: true,
        createdAt: true
      }
    })

    return NextResponse.json({
      message: 'Status dos administradores',
      admins,
      count: admins.length
    })

  } catch (error) {
    console.error('Erro ao verificar admin:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error instanceof Error ? error.message : 'Erro desconhecido' },
      { status: 500 }
    )
  }
}