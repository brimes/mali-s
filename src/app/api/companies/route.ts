import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const companySchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  cnpj: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  companyGroupId: z.string().optional()
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const companyGroupId = searchParams.get('companyGroupId')

    const companies = await prisma.company.findMany({
      where: companyGroupId ? { companyGroupId } : undefined,
      include: {
        companyGroup: {
          select: {
            id: true,
            name: true
          }
        },
        _count: {
          select: {
            users: true,
            clientes: true,
            funcionarios: true,
            servicos: true,
            agendamentos: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json(companies)
  } catch (error) {
    console.error('Erro ao buscar empresas:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Filtrar campos vazios
    const filteredData = Object.fromEntries(
      Object.entries(body).filter(([_, value]) => value !== '' && value !== undefined)
    )
    
    const validatedData = companySchema.parse(filteredData)

    const company = await prisma.company.create({
      data: validatedData,
      include: {
        companyGroup: {
          select: {
            id: true,
            name: true
          }
        },
        _count: {
          select: {
            users: true,
            clientes: true,
            funcionarios: true,
            servicos: true,
            agendamentos: true
          }
        }
      }
    })

    return NextResponse.json(company, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar empresa:', error)
    
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