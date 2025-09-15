import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const sendVerificationSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(10, 'Telefone inválido')
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = sendVerificationSchema.parse(body)

    // Verificar se email ou telefone já existem
    const existingEmail = await prisma.user.findUnique({
      where: { email: validatedData.email }
    })

    if (existingEmail) {
      return NextResponse.json(
        { error: 'Este email já está cadastrado' },
        { status: 400 }
      )
    }

    const existingPhone = await prisma.user.findFirst({
      where: { phone: validatedData.phone }
    })

    if (existingPhone) {
      return NextResponse.json(
        { error: 'Este telefone já está cadastrado' },
        { status: 400 }
      )
    }

    // Gerar código de 6 dígitos
    const code = Math.floor(100000 + Math.random() * 900000).toString()

    // Simular envio de SMS (em produção, usar serviço como Twilio)
    console.log(`SMS para ${validatedData.phone}: Seu código Mali-S é: ${code}`)
    
    // Em uma implementação real, você salvaria o código temporariamente 
    // no banco de dados ou cache (Redis) com expiração
    // Por ora, vamos simular usando um código fixo para desenvolvimento
    const devCode = '123456'
    
    // Salvar código temporário no "cache" (em produção usar Redis)
    // Para desenvolvimento, vamos aceitar tanto o código gerado quanto 123456
    const globalAny = global as any
    globalAny.verificationCodes = globalAny.verificationCodes || {}
    globalAny.verificationCodes[validatedData.phone] = {
      code: devCode, // Em desenvolvimento sempre usar 123456
      generatedCode: code, // Código real que seria enviado
      expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutos
      attempts: 0
    }

    return NextResponse.json({
      message: 'Código de verificação enviado com sucesso',
      phone: validatedData.phone,
      // Em desenvolvimento, retornar o código para facilitar testes
      ...(process.env.NODE_ENV === 'development' && { devCode })
    })
  } catch (error) {
    console.error('Erro ao enviar código de verificação:', error)
    
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