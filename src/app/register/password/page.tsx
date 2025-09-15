'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Logo } from '@/components/ui/logo'
import { toast } from 'sonner'

export default function PasswordPage() {
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  })
  const [registrationData, setRegistrationData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const validatePassword = (password: string) => {
    const errors = []
    
    if (password.length < 6) {
      errors.push('Deve ter pelo menos 6 caracteres')
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Deve conter pelo menos uma letra maiúscula')
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Deve conter pelo menos uma letra minúscula')
    }
    if (!/[0-9]/.test(password)) {
      errors.push('Deve conter pelo menos um número')
    }
    
    return errors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Validações
      if (!formData.password.trim()) {
        toast.error('Senha é obrigatória')
        return
      }

      const passwordErrors = validatePassword(formData.password)
      if (passwordErrors.length > 0) {
        toast.error(`Senha inválida: ${passwordErrors.join(', ')}`)
        return
      }

      if (formData.password !== formData.confirmPassword) {
        toast.error('Senhas não coincidem')
        return
      }

      // Preparar dados completos para o cadastro
      const completeData = {
        ...registrationData,
        password: formData.password
      }

      // Chamar API para finalizar cadastro
      const response = await fetch('/api/auth/complete-registration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(completeData)
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || 'Erro ao finalizar cadastro')
        return
      }

      // Limpar dados do localStorage
      localStorage.removeItem('registrationData')

      toast.success('Cadastro realizado com sucesso!')
      toast.success('Você já pode fazer login no sistema')

      // Redirecionar para login
      router.push('/login')
    } catch (error) {
      toast.error('Erro ao finalizar cadastro. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  const passwordErrors = formData.password ? validatePassword(formData.password) : []

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
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Senha de Acesso</h1>
            <p className="text-gray-600">Defina uma senha segura para acessar o sistema</p>
          </div>

          {/* Resumo dos dados */}
          <div className="bg-purple-50 p-4 rounded-lg mb-6">
            <h3 className="font-semibold text-purple-800 mb-2">Resumo do seu cadastro:</h3>
            <div className="text-sm text-purple-700 space-y-1">
              <p><strong>Nome:</strong> {registrationData.name}</p>
              <p><strong>Email:</strong> {registrationData.email}</p>
              <p><strong>Telefone:</strong> {registrationData.phone}</p>
              <p><strong>Tipo:</strong> {
                registrationData.businessType === 'individual' ? 'Individual' :
                registrationData.businessType === 'salon' ? 'Salão' : 'Grupo de Salões'
              }</p>
              {registrationData.address?.companyName && (
                <p><strong>Empresa:</strong> {registrationData.address.companyName}</p>
              )}
            </div>
          </div>

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Senha *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                  placeholder="Digite sua senha"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              
              {/* Indicadores de força da senha */}
              {formData.password && (
                <div className="mt-2">
                  <div className="flex space-x-1 mb-2">
                    <div className={`h-1 w-1/4 rounded ${passwordErrors.length <= 2 ? 'bg-green-500' : passwordErrors.length <= 3 ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
                    <div className={`h-1 w-1/4 rounded ${passwordErrors.length <= 1 ? 'bg-green-500' : passwordErrors.length <= 2 ? 'bg-yellow-500' : 'bg-gray-300'}`}></div>
                    <div className={`h-1 w-1/4 rounded ${passwordErrors.length === 0 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <div className={`h-1 w-1/4 rounded ${passwordErrors.length === 0 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  </div>
                  {passwordErrors.length > 0 && (
                    <ul className="text-xs text-red-600 space-y-1">
                      {passwordErrors.map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                    </ul>
                  )}
                  {passwordErrors.length === 0 && (
                    <p className="text-xs text-green-600">✓ Senha forte</p>
                  )}
                </div>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirmar senha *
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                  placeholder="Confirme sua senha"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              
              {formData.confirmPassword && formData.password && (
                <div className="mt-1">
                  {formData.password === formData.confirmPassword ? (
                    <p className="text-xs text-green-600">✓ Senhas coincidem</p>
                  ) : (
                    <p className="text-xs text-red-600">✗ Senhas não coincidem</p>
                  )}
                </div>
              )}
            </div>

            {/* Botões de ação */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                type="button"
                onClick={() => router.push('/register/services')}
                className="flex-1 bg-white text-gray-700 py-3 px-4 rounded-lg font-medium border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all"
              >
                ← Voltar
              </button>
              <button
                type="submit"
                disabled={isLoading || passwordErrors.length > 0 || formData.password !== formData.confirmPassword}
                className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white py-3 px-4 rounded-lg font-medium hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Finalizando...
                  </div>
                ) : (
                  'Finalizar cadastro'
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>&copy; 2024 Mali-S. Todos os direitos reservados.</p>
        </div>
      </div>
    </div>
  )
}