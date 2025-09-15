'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Logo } from '@/components/ui/logo'
import { toast } from 'sonner'

type BusinessType = 'individual' | 'salon' | 'group'

export default function BusinessTypePage() {
  const [selectedType, setSelectedType] = useState<BusinessType | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const businessTypes = [
    {
      id: 'individual' as BusinessType,
      title: 'Individual',
      description: 'Profissional autônomo que trabalha sozinho',
      icon: '👤',
      details: 'Ideal para profissionais que atendem individualmente'
    },
    {
      id: 'salon' as BusinessType,
      title: 'Salão',
      description: 'Estabelecimento com equipe de funcionários',
      icon: '✂️',
      details: 'Perfeito para salões com múltiplos profissionais'
    },
    {
      id: 'group' as BusinessType,
      title: 'Grupo de Salões',
      description: 'Rede ou franquia com múltiplas unidades',
      icon: '🏢',
      details: 'Para quem possui ou gerencia várias unidades'
    }
  ]

  const handleContinue = () => {
    if (!selectedType) {
      toast.error('Selecione um tipo de negócio')
      return
    }

    // Salvar tipo selecionado no localStorage
    const registrationData = JSON.parse(localStorage.getItem('registrationData') || '{}')
    const updatedData = {
      ...registrationData,
      businessType: selectedType
    }
    localStorage.setItem('registrationData', JSON.stringify(updatedData))

    // Redirecionar para próxima etapa
    router.push('/register/address')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="bg-white rounded-xl shadow-xl p-8">
          {/* Logo e Título */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <Logo size="xl" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Tipo de Negócio</h1>
            <p className="text-gray-600">Escolha a opção que melhor descreve seu negócio</p>
          </div>

          {/* Opções de tipo de negócio */}
          <div className="space-y-4 mb-8">
            {businessTypes.map((type) => (
              <div
                key={type.id}
                onClick={() => setSelectedType(type.id)}
                className={`
                  p-6 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md
                  ${selectedType === type.id 
                    ? 'border-purple-500 bg-purple-50' 
                    : 'border-gray-200 hover:border-purple-300'
                  }
                `}
              >
                <div className="flex items-start space-x-4">
                  <div className="text-3xl">{type.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-lg font-semibold text-gray-900">{type.title}</h3>
                      {selectedType === type.id && (
                        <div className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <p className="text-gray-600 mt-1">{type.description}</p>
                    <p className="text-sm text-gray-500 mt-2">{type.details}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Botões de ação */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="button"
              onClick={() => router.push('/register/verify')}
              className="flex-1 bg-white text-gray-700 py-3 px-4 rounded-lg font-medium border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all"
            >
              ← Voltar
            </button>
            <button
              onClick={handleContinue}
              disabled={!selectedType || isLoading}
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Processando...
                </div>
              ) : (
                'Continuar'
              )}
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