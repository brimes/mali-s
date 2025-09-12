import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import fs from 'fs'
import path from 'path'

// Função para copiar banco inicial se não existir
async function ensureInitialDatabase() {
  const databaseUrl = process.env.DATABASE_URL || 'file:./data/salon.db'
  let dbPath = databaseUrl.replace('file:', '')
  
  if (dbPath.startsWith('./')) {
    dbPath = path.resolve(process.cwd(), dbPath.slice(2))
  } else if (!path.isAbsolute(dbPath)) {
    dbPath = path.resolve(process.cwd(), dbPath)
  }
  
  const dbExists = fs.existsSync(dbPath)
  console.log('📍 Caminho do banco:', dbPath)
  console.log('🗄️  Banco existe:', dbExists)
  
  if (!dbExists) {
    // Procurar banco inicial no projeto
    const initialDbPath = path.resolve(process.cwd(), 'prisma/data/salon.initial.db')
    
    if (fs.existsSync(initialDbPath)) {
      console.log('📋 Copiando banco inicial...')
      
      // Criar diretório se não existir
      const dbDir = path.dirname(dbPath)
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true })
        console.log('📁 Diretório criado:', dbDir)
      }
      
      // Copiar banco inicial
      fs.copyFileSync(initialDbPath, dbPath)
      console.log('✅ Banco inicial copiado com sucesso!')
      
      return { created: true, copied: true }
    } else {
      console.log('⚠️  Banco inicial não encontrado, será necessário criar manualmente')
      return { created: false, copied: false }
    }
  }
  
  return { created: false, copied: false }
}

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

    // Verificar e copiar banco inicial se necessário
    const dbInfo = await ensureInitialDatabase()

    // Verificar se já existe um admin
    let existingAdmin
    try {
      existingAdmin = await prisma.user.findFirst({
        where: {
          userType: 'ADMIN'
        }
      })
    } catch (error) {
      console.error('❌ Erro ao buscar admin existente:', error)
      return NextResponse.json(
        { 
          error: 'Erro ao verificar usuário admin existente', 
          details: error instanceof Error ? error.message : 'Erro desconhecido'
        },
        { status: 500 }
      )
    }

    if (existingAdmin) {
      return NextResponse.json({
        message: 'Admin já existe',
        admin: {
          id: existingAdmin.id,
          name: existingAdmin.name,
          email: existingAdmin.email,
          userType: existingAdmin.userType,
          createdAt: existingAdmin.createdAt
        },
        databaseInfo: dbInfo
      })
    }

    // Criar admin padrão
    console.log('👤 Criando usuário admin...')
    const hashedPassword = await bcrypt.hash('Mali#2024@Admin!', 12)
    
    let adminUser
    try {
      adminUser = await prisma.user.create({
        data: {
          name: 'Administrador do Sistema',
          email: 'admin@mali-s.com',
          password: hashedPassword,
          userType: 'ADMIN',
          active: true,
          phone: '(00) 00000-0000',
        }
      })
      console.log('✅ Admin criado com sucesso!')
    } catch (error) {
      console.error('❌ Erro ao criar admin:', error)
      return NextResponse.json(
        { 
          error: 'Erro ao criar usuário admin', 
          details: error instanceof Error ? error.message : 'Erro desconhecido'
        },
        { status: 500 }
      )
    }

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
      },
      databaseInfo: dbInfo
    })

  } catch (error) {
    console.error('💥 Erro geral ao criar admin:', error)
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor', 
        details: error instanceof Error ? error.message : 'Erro desconhecido' 
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
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

    // Verificar status do banco
    const databaseUrl = process.env.DATABASE_URL || 'file:./data/salon.db'
    let dbPath = databaseUrl.replace('file:', '')
    
    if (dbPath.startsWith('./')) {
      dbPath = path.resolve(process.cwd(), 'prisma', dbPath.slice(2))
    } else if (!path.isAbsolute(dbPath)) {
      dbPath = path.resolve(process.cwd(), 'prisma', dbPath)
    }
    
    const dbExists = fs.existsSync(dbPath)
    let connectivity = false
    let admins: Array<{
      id: string
      name: string
      email: string
      userType: string
      active: boolean
      createdAt: Date
    }> = []
    let stats = null

    try {
      await prisma.$connect()
      connectivity = true
      
      // Verificar status dos administradores
      admins = await prisma.user.findMany({
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

      // Estatísticas gerais
      stats = {
        users: await prisma.user.count(),
        companies: await prisma.company.count(),
        companyGroups: await prisma.companyGroup.count(),
      }

    } catch (error) {
      console.error('Erro de conectividade:', error)
    }

    return NextResponse.json({
      message: 'Status do sistema',
      database: {
        path: dbPath,
        exists: dbExists,
        connectivity,
        url: process.env.DATABASE_URL ? '***configurado***' : 'não configurado'
      },
      admins,
      adminCount: admins.length,
      stats,
      environment: {
        nodeEnv: process.env.NODE_ENV,
        initTokenConfigured: !!process.env.INIT_ADMIN_TOKEN
      }
    })

  } catch (error) {
    console.error('Erro ao verificar status:', error)
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor', 
        details: error instanceof Error ? error.message : 'Erro desconhecido' 
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}