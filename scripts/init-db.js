const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

async function checkAndCreateAdminUser() {
  try {
    console.log('🔍 Verificando se o banco de dados existe...')
    
    // Determinar o caminho do banco baseado na variável de ambiente ou padrão
    const databaseUrl = process.env.DATABASE_URL || 'file:./data/salon.db'
    let dbPath = databaseUrl.replace('file:', '')
    
    // Resolver caminho absoluto
    if (dbPath.startsWith('./')) {
      dbPath = path.resolve(process.cwd(), dbPath)
    } else if (!path.isAbsolute(dbPath)) {
      dbPath = path.resolve(process.cwd(), dbPath)
    }
    
    const dbExists = fs.existsSync(dbPath)
    console.log(`📍 Caminho do banco: ${dbPath}`)
    console.log(`🗄️ Banco existe: ${dbExists}`)
    
    if (!dbExists) {
      console.log('⚠️  Banco de dados não encontrado. Criando estrutura inicial...')
      
      // Criar diretório de dados se não existir
      const dataDir = path.dirname(dbPath)
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true })
        console.log(`📁 Diretório de dados criado: ${dataDir}`)
      }
      
      // Executar push do schema para criar o banco
      console.log('📋 Criando estrutura do banco de dados...')
      try {
        execSync('npx prisma db push --force-reset', { stdio: 'inherit' })
        console.log('✅ Estrutura do banco criada com sucesso!')
      } catch (error) {
        console.error('❌ Erro ao criar estrutura do banco:', error)
        throw error
      }
    }
    
    // Usar Prisma Client para verificar/criar admin
    try {
      const { PrismaClient } = require('@prisma/client')
      const bcrypt = require('bcryptjs')
      
      const prisma = new PrismaClient()
      
      // Verificar se já existe um usuário admin
      console.log('👤 Verificando usuário admin...')
      const existingAdmin = await prisma.user.findFirst({
        where: {
          email: 'admin@mali-s.com',
          userType: 'ADMIN'
        }
      })
      
      if (!existingAdmin) {
        console.log('🔐 Criando usuário admin padrão...')
        
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
        
        console.log('✅ Usuário admin criado com sucesso!')
        console.log('📧 Email: admin@mali-s.com')
        console.log('🔑 Senha: Mali#2024@Admin!')
        console.log('⚠️  IMPORTANTE: Altere a senha padrão após o primeiro login!')
        
        await prisma.$disconnect()
        return adminUser
      } else {
        console.log('✅ Usuário admin já existe. Nenhuma ação necessária.')
        console.log(`📧 Email: ${existingAdmin.email}`)
        console.log(`👤 Nome: ${existingAdmin.name}`)
        await prisma.$disconnect()
        return existingAdmin
      }
    } catch (prismaError) {
      console.error('❌ Erro ao usar Prisma Client:', prismaError)
      console.log('⚠️ Ignorando verificação do admin - será criado no primeiro acesso.')
    }
  } catch (error) {
    console.error('❌ Erro ao verificar/criar usuário admin:', error)
    console.log('⚠️ Continuando inicialização...')
  }
}

async function initializeDatabase() {
  console.log('🚀 Iniciando verificação do banco de dados...')
  
  try {
    // Verificar e criar usuário admin
    await checkAndCreateAdminUser()
    
    console.log('🎉 Inicialização do banco de dados concluída com sucesso!')
  } catch (error) {
    console.error('💥 Erro durante a inicialização:', error)
    console.log('⚠️ Continuando com a aplicação...')
    // Não sair com erro para não quebrar a aplicação
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  initializeDatabase()
}

module.exports = { initializeDatabase, checkAndCreateAdminUser }