import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const verifyCodeSchema = z.object({
  phone: z.string().min(10, 'Telefone inválido'),
  code: z.string().length(6, 'Código deve ter 6 dígitos')
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = verifyCodeSchema.parse(body)

    // Recuperar código do "cache"
    const globalAny = global as any
    const verificationCodes = globalAny.verificationCodes || {}
    const savedCode = verificationCodes[validatedData.phone]

    if (!savedCode) {
      return NextResponse.json(
        { error: 'Código não encontrado ou expirado' },
        { status: 400 }
      )
    }

    // Verificar se o código expirou
    if (Date.now() > savedCode.expiresAt) {
      delete verificationCodes[validatedData.phone]
      return NextResponse.json(
        { error: 'Código expirado. Solicite um novo código.' },
        { status: 400 }
      )
    }

    // Verificar tentativas
    if (savedCode.attempts >= 3) {
      delete verificationCodes[validatedData.phone]
      return NextResponse.json(
        { error: 'Muitas tentativas. Solicite um novo código.' },
        { status: 400 }
      )
    }

    // Verificar código
    if (validatedData.code !== savedCode.code) {
      savedCode.attempts += 1
      return NextResponse.json(
        { error: 'Código inválido' },
        { status: 400 }
      )
    }

    // Código válido - remover do cache
    delete verificationCodes[validatedData.phone]

    return NextResponse.json({
      message: 'Código verificado com sucesso',
      verified: true
    })
  } catch (error) {
    console.error('Erro ao verificar código:', error)
    
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