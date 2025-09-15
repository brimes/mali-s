'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Logo } from '@/components/ui/logo'
import { toast } from 'sonner'

interface Employee {
  id: string
  name: string
  phone: string
  specialties: string[]
  workDays: string[]
  startTime: string
  endTime: string
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    specialties: [] as string[],
    workDays: [] as string[],
    startTime: '08:00',
    endTime: '18:00'
  })
  const [registrationData, setRegistrationData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const specialtyOptions = [
    'Corte masculino', 'Corte feminino', 'Coloração', 'Mechas', 'Escova', 
    'Chapinha', 'Cachos', 'Manicure', 'Pedicure', 'Unhas em gel',
    'Sobrancelha', 'Depilação', 'Limpeza de pele', 'Hidratação'
  ]

  const workDayOptions = [
    { id: 'segunda', label: 'Segunda-feira' },
    { id: 'terca', label: 'Terça-feira' },
    { id: 'quarta', label: 'Quarta-feira' },
    { id: 'quinta', label: 'Quinta-feira' },
    { id: 'sexta', label: 'Sexta-feira' },
    { id: 'sabado', label: 'Sábado' },
    { id: 'domingo', label: 'Domingo' }
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
    
    // Recuperar funcionários já salvos
    if (data.employees) {
      setEmployees(data.employees)
    }
  }, [router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSpecialtyChange = (specialty: string) => {
    setFormData(prev => ({
      ...prev,
      specialties: prev.specialties.includes(specialty)
        ? prev.specialties.filter(s => s !== specialty)
        : [...prev.specialties, specialty]
    }))
  }

  const handleWorkDayChange = (day: string) => {
    setFormData(prev => ({
      ...prev,
      workDays: prev.workDays.includes(day)
        ? prev.workDays.filter(d => d !== day)
        : [...prev.workDays, day]
    }))
  }

  const handleSubmitEmployee = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      toast.error('Nome é obrigatório')
      return
    }
    if (!formData.phone.trim()) {
      toast.error('Telefone é obrigatório')
      return
    }
    if (formData.specialties.length === 0) {
      toast.error('Selecione pelo menos uma especialidade')
      return
    }
    if (formData.workDays.length === 0) {
      toast.error('Selecione pelo menos um dia de trabalho')
      return
    }

    const newEmployee: Employee = {
      id: editingEmployee?.id || Date.now().toString(),
      name: formData.name,
      phone: formData.phone,
      specialties: formData.specialties,
      workDays: formData.workDays,
      startTime: formData.startTime,
      endTime: formData.endTime
    }

    if (editingEmployee) {
      setEmployees(prev => prev.map(emp => emp.id === editingEmployee.id ? newEmployee : emp))
      toast.success('Funcionário atualizado!')
    } else {
      setEmployees(prev => [...prev, newEmployee])
      toast.success('Funcionário adicionado!')
    }

    // Reset form
    setFormData({
      name: '',
      phone: '',
      specialties: [],
      workDays: [],
      startTime: '08:00',
      endTime: '18:00'
    })
    setShowForm(false)
    setEditingEmployee(null)
  }

  const handleEditEmployee = (employee: Employee) => {
    setFormData({
      name: employee.name,
      phone: employee.phone,
      specialties: employee.specialties,
      workDays: employee.workDays,
      startTime: employee.startTime,
      endTime: employee.endTime
    })
    setEditingEmployee(employee)
    setShowForm(true)
  }

  const handleDeleteEmployee = (id: string) => {
    setEmployees(prev => prev.filter(emp => emp.id !== id))
    toast.success('Funcionário removido!')
  }

  const handleContinue = () => {
    setIsLoading(true)
    
    // Salvar funcionários no localStorage
    const updatedData = {
      ...registrationData,
      employees: employees
    }
    localStorage.setItem('registrationData', JSON.stringify(updatedData))
    
    toast.success('Funcionários salvos!')
    router.push('/register/services')
  }

  const handleSkip = () => {
    // Continuar sem funcionários
    router.push('/register/services')
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
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Funcionários</h1>
            <p className="text-gray-600">Adicione os funcionários da sua empresa</p>
          </div>

          {!showForm ? (
            <>
              {/* Lista de funcionários */}
              <div className="space-y-4 mb-8">
                {employees.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>Nenhum funcionário adicionado ainda</p>
                    <p className="text-sm">Clique em "Adicionar funcionário" para começar</p>
                  </div>
                ) : (
                  employees.map((employee) => (
                    <div key={employee.id} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{employee.name}</h3>
                          <p className="text-gray-600">{employee.phone}</p>
                          <p className="text-sm text-gray-500 mt-1">
                            <strong>Especialidades:</strong> {employee.specialties.join(', ')}
                          </p>
                          <p className="text-sm text-gray-500">
                            <strong>Dias:</strong> {employee.workDays.join(', ')} | 
                            <strong> Horário:</strong> {employee.startTime} às {employee.endTime}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditEmployee(employee)}
                            className="text-purple-600 hover:text-purple-700 text-sm"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDeleteEmployee(employee.id)}
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
                  {editingEmployee ? 'Editar funcionário' : 'Adicionar funcionário'}
                </button>

                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={() => router.push('/register/address')}
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
            /* Formulário de funcionário */
            <form onSubmit={handleSubmitEmployee} className="space-y-6">
              {/* Nome e Telefone */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Nome completo *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                    placeholder="Nome do funcionário"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Telefone *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                    placeholder="(11) 99999-9999"
                  />
                </div>
              </div>

              {/* Especialidades */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Especialidades *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {specialtyOptions.map((specialty) => (
                    <label key={specialty} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.specialties.includes(specialty)}
                        onChange={() => handleSpecialtyChange(specialty)}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="text-sm text-gray-700">{specialty}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Dias de trabalho */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dias de trabalho *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {workDayOptions.map((day) => (
                    <label key={day.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.workDays.includes(day.id)}
                        onChange={() => handleWorkDayChange(day.id)}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="text-sm text-gray-700">{day.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Horários */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-2">
                    Horário de início
                  </label>
                  <input
                    type="time"
                    id="startTime"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                  />
                </div>
                <div>
                  <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-2">
                    Horário de término
                  </label>
                  <input
                    type="time"
                    id="endTime"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                  />
                </div>
              </div>

              {/* Botões do formulário */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false)
                    setEditingEmployee(null)
                    setFormData({
                      name: '',
                      phone: '',
                      specialties: [],
                      workDays: [],
                      startTime: '08:00',
                      endTime: '18:00'
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
                  {editingEmployee ? 'Atualizar funcionário' : 'Adicionar funcionário'}
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