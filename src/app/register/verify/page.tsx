'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Logo } from '@/components/ui/logo'
import { toast } from 'sonner'

export default function VerifyPage() {
  const [code, setCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [registrationData, setRegistrationData] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    // Recuperar dados do localStorage
    const savedData = localStorage.getItem('registrationData')
    if (!savedData) {
      toast.error('Dados de registro não encontrados')
      router.push('/register')
      return
    }
    setRegistrationData(JSON.parse(savedData))
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (!code.trim()) {
        toast.error('Código é obrigatório')
        return
      }

      if (code.length !== 6) {
        toast.error('Código deve ter 6 dígitos')
        return
      }

      // Chamar API para verificar código
      const response = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          phone: registrationData?.phone,
          code: code
        })
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || 'Código inválido')
        return
      }

      toast.success('Código verificado com sucesso!')
      router.push('/register/business-type')
    } catch (error) {
      toast.error('Erro ao verificar código. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendCode = async () => {
    try {
      const response = await fetch('/api/auth/send-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(registrationData)
      })

      if (response.ok) {
        toast.success('Novo código enviado!')
      } else {
        toast.error('Erro ao reenviar código')
      }
    } catch (error) {
      toast.error('Erro ao reenviar código')
    }
  }

  if (!registrationData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl shadow-xl p-8">
          {/* Logo e Título */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <Logo size="xl" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Verificação</h1>
            <p className="text-gray-600">
              Digite o código de 6 dígitos enviado para
            </p>
            <p className="text-purple-600 font-medium">{registrationData?.phone}</p>
          </div>

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
                Código de verificação
              </label>
              <input
                type="text"
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors text-center text-2xl font-mono tracking-widest"
                placeholder="000000"
                maxLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || code.length !== 6}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Verificando...
                </div>
              ) : (
                'Verificar código'
              )}
            </button>
          </form>

          {/* Links */}
          <div className="mt-6 text-center space-y-2">
            <button
              type="button"
              onClick={handleResendCode}
              className="text-sm text-purple-600 hover:text-purple-700 transition-colors"
            >
              Reenviar código
            </button>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => router.push('/register')}
                className="text-sm text-gray-600 hover:text-gray-700 transition-colors"
              >
                ← Alterar telefone
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>&copy; 2024 Mali-S. Todos os direitos reservados.</p>
        </div>
      </div>
    </div>
  )
}