'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Logo } from '@/components/ui/logo'
import { toast } from 'sonner'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [validationErrors, setValidationErrors] = useState({
    emailExists: false,
    phoneExists: false
  })
  const [isValidating, setIsValidating] = useState({
    email: false,
    phone: false
  })
  const router = useRouter()

  // Debounce para validações
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.email && formData.email.includes('@')) {
        checkEmailExists(formData.email)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [formData.email])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.phone && formData.phone.length >= 10) {
        checkPhoneExists(formData.phone)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [formData.phone])

  const checkEmailExists = async (email: string) => {
    if (!email || !email.includes('@')) return

    setIsValidating(prev => ({ ...prev, email: true }))
    
    try {
      const response = await fetch('/api/auth/check-existing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      })

      const data = await response.json()
      
      if (response.ok) {
        setValidationErrors(prev => ({ ...prev, emailExists: data.emailExists }))
      }
    } catch (error) {
      console.error('Erro ao verificar email:', error)
    } finally {
      setIsValidating(prev => ({ ...prev, email: false }))
    }
  }

  const checkPhoneExists = async (phone: string) => {
    if (!phone || phone.length < 10) return

    setIsValidating(prev => ({ ...prev, phone: true }))
    
    try {
      const response = await fetch('/api/auth/check-existing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ phone })
      })

      const data = await response.json()
      
      if (response.ok) {
        setValidationErrors(prev => ({ ...prev, phoneExists: data.phoneExists }))
      }
    } catch (error) {
      console.error('Erro ao verificar telefone:', error)
    } finally {
      setIsValidating(prev => ({ ...prev, phone: false }))
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Validações básicas
      if (!formData.name.trim()) {
        toast.error('Nome é obrigatório')
        return
      }
      if (!formData.email.trim()) {
        toast.error('Email é obrigatório')
        return
      }
      if (!formData.phone.trim()) {
        toast.error('Telefone é obrigatório')
        return
      }

      // Verificar se email ou telefone já existem
      if (validationErrors.emailExists) {
        toast.error('Este email já está cadastrado')
        return
      }
      if (validationErrors.phoneExists) {
        toast.error('Este telefone já está cadastrado')
        return
      }

      // Fazer uma verificação final antes de enviar o SMS
      const finalCheck = await fetch('/api/auth/check-existing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: formData.email,
          phone: formData.phone
        })
      })

      const finalData = await finalCheck.json()
      
      if (finalData.emailExists) {
        toast.error('Este email já está cadastrado')
        return
      }
      if (finalData.phoneExists) {
        toast.error('Este telefone já está cadastrado')
        return
      }

      // Chamar API para enviar código de verificação
      const response = await fetch('/api/auth/send-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || 'Erro ao enviar código de verificação')
        return
      }

      // Salvar dados temporários no localStorage
      localStorage.setItem('registrationData', JSON.stringify(formData))
      
      toast.success('Código de verificação enviado para seu telefone!')
      router.push('/register/verify')
    } catch (error) {
      toast.error('Erro ao processar solicitação. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
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
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Criar Conta</h1>
            <p className="text-gray-600">Comece seu cadastro no Mali-S</p>
          </div>

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Nome completo
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                placeholder="Seu nome completo"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors ${
                    validationErrors.emailExists 
                      ? 'border-red-300 bg-red-50' 
                      : formData.email && !isValidating.email && !validationErrors.emailExists 
                        ? 'border-green-300 bg-green-50' 
                        : 'border-gray-300'
                  }`}
                  placeholder="seu@email.com"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  {isValidating.email ? (
                    <div className="w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                  ) : validationErrors.emailExists ? (
                    <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  ) : formData.email && formData.email.includes('@') && !isValidating.email ? (
                    <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  ) : null}
                </div>
              </div>
              {validationErrors.emailExists && (
                <p className="mt-1 text-sm text-red-600">Este email já está cadastrado</p>
              )}
              {formData.email && !isValidating.email && !validationErrors.emailExists && formData.email.includes('@') && (
                <p className="mt-1 text-sm text-green-600">Email disponível</p>
              )}
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Telefone
              </label>
              <div className="relative">
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors ${
                    validationErrors.phoneExists 
                      ? 'border-red-300 bg-red-50' 
                      : formData.phone && formData.phone.length >= 10 && !isValidating.phone && !validationErrors.phoneExists 
                        ? 'border-green-300 bg-green-50' 
                        : 'border-gray-300'
                  }`}
                  placeholder="(11) 99999-9999"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  {isValidating.phone ? (
                    <div className="w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                  ) : validationErrors.phoneExists ? (
                    <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  ) : formData.phone && formData.phone.length >= 10 && !isValidating.phone ? (
                    <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  ) : null}
                </div>
              </div>
              {validationErrors.phoneExists && (
                <p className="mt-1 text-sm text-red-600">Este telefone já está cadastrado</p>
              )}
              {formData.phone && formData.phone.length >= 10 && !isValidating.phone && !validationErrors.phoneExists && (
                <p className="mt-1 text-sm text-green-600">Telefone disponível</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || validationErrors.emailExists || validationErrors.phoneExists || isValidating.email || isValidating.phone}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Enviando código...
                </div>
              ) : isValidating.email || isValidating.phone ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Verificando dados...
                </div>
              ) : (
                'Enviar código de verificação'
              )}
            </button>
          </form>

          {/* Link para voltar */}
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => router.push('/login')}
              className="text-sm text-purple-600 hover:text-purple-700 transition-colors"
            >
              ← Voltar para o login
            </button>
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