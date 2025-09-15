'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Logo } from '@/components/ui/logo'
import { toast } from 'sonner'

interface Service {
  id: string
  name: string
  description: string
  duration: number
  price: number
  category: string
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    duration: 30,
    price: 0,
    category: ''
  })
  const [registrationData, setRegistrationData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const categoryOptions = [
    'Cabelo',
    'Unha',
    'Sobrancelha',
    'Depilação',
    'Estética',
    'Massagem',
    'Outros'
  ]

  useEffect(() => {
    // Recuperar dados do localStorage
    const savedData = localStorage.getItem('registrationData')
    if (!savedData) {
      toast.error('Dados de registro não encontrados')
      router.push('/register')
      return
    }
    const data = JSON.parse(savedData)
    setRegistrationData(data)
    
    // Recuperar serviços já salvos
    if (data.services) {
      setServices(data.services)
    }
  }, [router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }))
  }

  const handleSubmitService = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      toast.error('Nome do serviço é obrigatório')
      return
    }
    if (!formData.category) {
      toast.error('Categoria é obrigatória')
      return
    }
    if (formData.duration <= 0) {
      toast.error('Duração deve ser maior que zero')
      return
    }
    if (formData.price <= 0) {
      toast.error('Preço deve ser maior que zero')
      return
    }

    const newService: Service = {
      id: editingService?.id || Date.now().toString(),
      name: formData.name,
      description: formData.description,
      duration: formData.duration,
      price: formData.price,
      category: formData.category
    }

    if (editingService) {
      setServices(prev => prev.map(service => service.id === editingService.id ? newService : service))
      toast.success('Serviço atualizado!')
    } else {
      setServices(prev => [...prev, newService])
      toast.success('Serviço adicionado!')
    }

    // Reset form
    setFormData({
      name: '',
      description: '',
      duration: 30,
      price: 0,
      category: ''
    })
    setShowForm(false)
    setEditingService(null)
  }

  const handleEditService = (service: Service) => {
    setFormData({
      name: service.name,
      description: service.description,
      duration: service.duration,
      price: service.price,
      category: service.category
    })
    setEditingService(service)
    setShowForm(true)
  }

  const handleDeleteService = (id: string) => {
    setServices(prev => prev.filter(service => service.id !== id))
    toast.success('Serviço removido!')
  }

  const handleContinue = () => {
    setIsLoading(true)
    
    // Salvar serviços no localStorage
    const updatedData = {
      ...registrationData,
      services: services
    }
    localStorage.setItem('registrationData', JSON.stringify(updatedData))
    
    toast.success('Serviços salvos!')
    router.push('/register/password')
  }

  const handleSkip = () => {
    // Continuar sem serviços
    router.push('/register/password')
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price)
  }

  const formatDuration = (duration: number) => {
    if (duration < 60) {
      return `${duration} min`
    }
    const hours = Math.floor(duration / 60)
    const minutes = duration % 60
    return minutes > 0 ? `${hours}h ${minutes}min` : `${hours}h`
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-xl p-8">
          {/* Logo e Título */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <Logo size="xl" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Serviços</h1>
            <p className="text-gray-600">Cadastre os serviços que você oferece</p>
          </div>

          {!showForm ? (
            <>
              {/* Lista de serviços */}
              <div className="space-y-4 mb-8">
                {services.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>Nenhum serviço adicionado ainda</p>
                    <p className="text-sm">Clique em "Adicionar serviço" para começar</p>
                  </div>
                ) : (
                  services.map((service) => (
                    <div key={service.id} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold text-gray-900">{service.name}</h3>
                            <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                              {service.category}
                            </span>
                          </div>
                          {service.description && (
                            <p className="text-gray-600 mt-1">{service.description}</p>
                          )}
                          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                            <span><strong>Duração:</strong> {formatDuration(service.duration)}</span>
                            <span><strong>Preço:</strong> {formatPrice(service.price)}</span>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditService(service)}
                            className="text-purple-600 hover:text-purple-700 text-sm"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDeleteService(service.id)}
                            className="text-red-600 hover:text-red-700 text-sm"
                          >
                            Remover
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Botões de ação */}
              <div className="space-y-4">
                <button
                  onClick={() => setShowForm(true)}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all"
                >
                  {editingService ? 'Editar serviço' : 'Adicionar serviço'}
                </button>

                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={() => {
                      if (registrationData?.businessType === 'individual') {
                        router.push('/register/address')
                      } else {
                        router.push('/register/employees')
                      }
                    }}
                    className="flex-1 bg-white text-gray-700 py-3 px-4 rounded-lg font-medium border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all"
                  >
                    ← Voltar
                  </button>
                  <button
                    onClick={handleSkip}
                    className="flex-1 bg-white text-purple-600 py-3 px-4 rounded-lg font-medium border border-purple-600 hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all"
                  >
                    Cadastrar mais tarde
                  </button>
                  <button
                    onClick={handleContinue}
                    disabled={isLoading}
                    className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white py-3 px-4 rounded-lg font-medium hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {isLoading ? 'Salvando...' : 'Continuar'}
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* Formulário de serviço */
            <form onSubmit={handleSubmitService} className="space-y-6">
              {/* Nome do serviço */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Nome do serviço *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                  placeholder="Ex: Corte masculino"
                />
              </div>

              {/* Descrição */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição (opcional)
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                  placeholder="Descrição detalhada do serviço"
                />
              </div>

              {/* Categoria */}
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  Categoria *
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                >
                  <option value="">Selecione uma categoria</option>
                  {categoryOptions.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              {/* Duração e Preço */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
                    Duração (minutos) *
                  </label>
                  <input
                    type="number"
                    id="duration"
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                    required
                    min="15"
                    step="15"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                    placeholder="30"
                  />
                </div>
                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                    Preço (R$) *
                  </label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                    placeholder="30.00"
                  />
                </div>
              </div>

              {/* Botões do formulário */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false)
                    setEditingService(null)
                    setFormData({
                      name: '',
                      description: '',
                      duration: 30,
                      price: 0,
                      category: ''
                    })
                  }}
                  className="flex-1 bg-white text-gray-700 py-3 px-4 rounded-lg font-medium border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all"
                >
                  {editingService ? 'Atualizar serviço' : 'Adicionar serviço'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>&copy; 2024 Mali-S. Todos os direitos reservados.</p>
        </div>
      </div>
    </div>
  )
}