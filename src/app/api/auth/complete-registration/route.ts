import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const completeRegistrationSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(10, 'Telefone inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  businessType: z.enum(['individual', 'salon', 'group']),
  address: z.object({
    companyName: z.string().min(2, 'Nome da empresa é obrigatório'),
    cnpj: z.string().optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zipCode: z.string().optional()
  }),
  employees: z.array(z.object({
    id: z.string(),
    name: z.string(),
    phone: z.string(),
    specialties: z.array(z.string()),
    workDays: z.array(z.string()),
    startTime: z.string(),
    endTime: z.string()
  })).optional(),
  services: z.array(z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    duration: z.number(),
    price: z.number(),
    category: z.string()
  })).optional()
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = completeRegistrationSchema.parse(body)

    // Verificar se email já existe
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email já cadastrado' },
        { status: 400 }
      )
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(validatedData.password, 12)

    // Iniciar transação
    const result = await prisma.$transaction(async (tx) => {
      let companyGroup = null
      let company = null
      let user = null

      // 1. Criar CompanyGroup se necessário
      if (validatedData.businessType === 'group') {
        companyGroup = await tx.companyGroup.create({
          data: {
            name: `${validatedData.address.companyName} - Grupo`,
            description: `Grupo de empresas ${validatedData.address.companyName}`
          }
        })
      } else {
        // Para individual e salon, criar grupos padrão
        const groupName = validatedData.businessType === 'individual' 
          ? 'INDIVIDUAL' 
          : 'UNICA'
        
        companyGroup = await tx.companyGroup.create({
          data: {
            name: groupName,
            description: `Grupo ${groupName} para ${validatedData.address.companyName}`
          }
        })
      }

      // 2. Criar Company
      company = await tx.company.create({
        data: {
          name: validatedData.address.companyName,
          cnpj: validatedData.address.cnpj || null,
          phone: validatedData.address.phone || validatedData.phone,
          email: validatedData.address.email || validatedData.email,
          address: validatedData.address.address || null,
          city: validatedData.address.city || null,
          state: validatedData.address.state || null,
          zipCode: validatedData.address.zipCode || null,
          companyGroupId: companyGroup.id
        }
      })

      // 3. Determinar tipo de usuário
      let userType = 'COMPANY'
      if (validatedData.businessType === 'group') {
        userType = 'COMPANY_GROUP'
      }

                  // 4. Criar usuário
      user = await tx.user.create({
        data: {
          name: validatedData.name,
          email: validatedData.email,
          phone: validatedData.phone,
          password: hashedPassword,
          userType: userType,
          companyId: company.id,
          companyGroupId: companyGroup.id
        }
      })

      // 5. Criar funcionários se fornecidos
      if (validatedData.employees && validatedData.employees.length > 0) {
        for (const employee of validatedData.employees) {
          await tx.funcionario.create({
            data: {
              nome: employee.name,
              telefone: employee.phone,
              especialidades: JSON.stringify(employee.specialties),
              horarioInicio: employee.startTime,
              horarioFim: employee.endTime,
              diasTrabalho: JSON.stringify(employee.workDays),
              companyId: company.id
            }
          })
        }
      }

      // 6. Criar serviços se fornecidos
      if (validatedData.services && validatedData.services.length > 0) {
        for (const service of validatedData.services) {
          await tx.servico.create({
            data: {
              nome: service.name,
              descricao: service.description,
              duracao: service.duration,
              preco: service.price,
              categoria: service.category,
              companyId: company.id
            }
          })
        }
      }

      return { user, company, companyGroup }
    })

    // Retornar dados criados (sem senha)
    const responseData = {
      message: 'Cadastro realizado com sucesso',
      user: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        phone: result.user.phone,
        userType: result.user.userType
      },
      company: {
        id: result.company.id,
        name: result.company.name
      },
      companyGroup: {
        id: result.companyGroup.id,
        name: result.companyGroup.name
      }
    }

    return NextResponse.json(responseData, { status: 201 })
  } catch (error) {
    console.error('Erro ao completar registro:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}