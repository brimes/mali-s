import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const checkExistingSchema = z.object({
  email: z.string().email('Email inválido').optional(),
  phone: z.string().min(10, 'Telefone inválido').optional()
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = checkExistingSchema.parse(body)

    const results = {
      emailExists: false,
      phoneExists: false
    }

    // Verificar email se fornecido
    if (validatedData.email) {
      const existingEmail = await prisma.user.findUnique({
        where: { email: validatedData.email },
        select: { id: true }
      })
      results.emailExists = !!existingEmail
    }

    // Verificar telefone se fornecido
    if (validatedData.phone) {
      const existingPhone = await prisma.user.findFirst({
        where: { phone: validatedData.phone },
        select: { id: true }
      })
      results.phoneExists = !!existingPhone
    }

    return NextResponse.json(results)
  } catch (error) {
    console.error('Erro ao verificar dados existentes:', error)
    
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