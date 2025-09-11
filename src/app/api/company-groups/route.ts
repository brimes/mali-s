import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const companyGroupSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  description: z.string().optional()
})

export async function GET() {
  try {
    const companyGroups = await prisma.companyGroup.findMany({
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
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json(companyGroups)
  } catch (error) {
    console.error('Erro ao buscar grupos de empresas:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = companyGroupSchema.parse(body)

    const companyGroup = await prisma.companyGroup.create({
      data: validatedData,
      include: {
        companies: true,
        _count: {
          select: {
            companies: true,
            users: true
          }
        }
      }
    })

    return NextResponse.json(companyGroup, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar grupo de empresas:', error)
    
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