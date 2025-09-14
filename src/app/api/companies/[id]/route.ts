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
  companyGroupId: z.string().optional(),
  active: z.boolean().optional()
})

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    
    // Filtrar campos vazios
    const filteredData = Object.fromEntries(
      Object.entries(body).filter(([_, value]) => value !== '' && value !== undefined)
    )
    
    const validatedData = companySchema.parse(filteredData)

    const company = await prisma.company.update({
      where: { id: params.id },
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

    return NextResponse.json(company)
  } catch (error) {
    console.error('Erro ao atualizar empresa:', error)
    
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar se a empresa tem dados associados
    const company = await prisma.company.findUnique({
      where: { id: params.id },
      include: {
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

    if (!company) {
      return NextResponse.json(
        { error: 'Empresa não encontrada' },
        { status: 404 }
      )
    }

    // Verificar se há dados relacionados
    const hasRelatedData = Object.values(company._count).some(count => count > 0)
    
    if (hasRelatedData) {
      return NextResponse.json(
        { error: 'Não é possível excluir uma empresa que possui dados associados (usuários, clientes, funcionários, etc.)' },
        { status: 400 }
      )
    }

    await prisma.company.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Empresa excluída com sucesso' })
  } catch (error) {
    console.error('Erro ao excluir empresa:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const company = await prisma.company.findUnique({
      where: { id: params.id },
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

    if (!company) {
      return NextResponse.json(
        { error: 'Empresa não encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json(company)
  } catch (error) {
    console.error('Erro ao buscar empresa:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}