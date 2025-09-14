import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const companyGroupSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  description: z.string().optional()
})

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const validatedData = companyGroupSchema.parse(body)

    const companyGroup = await prisma.companyGroup.update({
      where: { id: params.id },
      data: validatedData,
      include: {
        companies: {
          select: {
            id: true,
            name: true,
            active: true
          }
        },
        _count: {
          select: {
            companies: true,
            users: true
          }
        }
      }
    })

    return NextResponse.json(companyGroup)
  } catch (error) {
    console.error('Erro ao atualizar grupo de empresas:', error)
    
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
    // Verificar se o grupo tem empresas associadas
    const group = await prisma.companyGroup.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            companies: true,
            users: true
          }
        }
      }
    })

    if (!group) {
      return NextResponse.json(
        { error: 'Grupo não encontrado' },
        { status: 404 }
      )
    }

    if (group._count.companies > 0) {
      return NextResponse.json(
        { error: 'Não é possível excluir um grupo que possui empresas associadas' },
        { status: 400 }
      )
    }

    await prisma.companyGroup.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Grupo excluído com sucesso' })
  } catch (error) {
    console.error('Erro ao excluir grupo de empresas:', error)
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
    const companyGroup = await prisma.companyGroup.findUnique({
      where: { id: params.id },
      include: {
        companies: {
          select: {
            id: true,
            name: true,
            active: true,
            cnpj: true,
            phone: true,
            email: true,
            address: true,
            city: true,
            state: true,
            zipCode: true
          }
        },
        _count: {
          select: {
            companies: true,
            users: true
          }
        }
      }
    })

    if (!companyGroup) {
      return NextResponse.json(
        { error: 'Grupo não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(companyGroup)
  } catch (error) {
    console.error('Erro ao buscar grupo de empresas:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}