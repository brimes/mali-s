'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { X, Save, User, Mail, Phone, Shield, Building, Building2, UserCheck } from 'lucide-react'

interface Company {
  id: string
  name: string
}

interface CompanyGroup {
  id: string
  name: string
}

interface User {
  id: string
  name: string
  email: string
  phone?: string
  userType: 'ADMIN' | 'COMPANY_GROUP' | 'COMPANY' | 'EMPLOYEE'
  active: boolean
  companyId?: string
  companyGroupId?: string
}

interface UserModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
  user?: User | null
  mode: 'create' | 'edit'
}

const userTypes = [
  { value: 'ADMIN', label: 'Administrador', icon: Shield, color: 'text-red-600' },
  { value: 'COMPANY_GROUP', label: 'Gerente de Grupo', icon: Building2, color: 'text-purple-600' },
  { value: 'COMPANY', label: 'Gerente de Empresa', icon: Building, color: 'text-blue-600' },
  { value: 'EMPLOYEE', label: 'Funcionário', icon: UserCheck, color: 'text-green-600' }
]

export default function UserModal({ isOpen, onClose, onSave, user, mode }: UserModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    userType: 'EMPLOYEE' as 'ADMIN' | 'COMPANY_GROUP' | 'COMPANY' | 'EMPLOYEE',
    active: true,
    companyId: '',
    companyGroupId: ''
  })
  const [loading, setLoading] = useState(false)
  const [companies, setCompanies] = useState<Company[]>([])
  const [companyGroups, setCompanyGroups] = useState<CompanyGroup[]>([])

  useEffect(() => {
    if (isOpen) {
      fetchCompanies()
      fetchCompanyGroups()
      
      if (mode === 'edit' && user) {
        setFormData({
          name: user.name,
          email: user.email,
          phone: user.phone || '',
          password: '',
          userType: user.userType,
          active: user.active,
          companyId: user.companyId || '',
          companyGroupId: user.companyGroupId || ''
        })
      } else {
        setFormData({
          name: '',
          email: '',
          phone: '',
          password: '',
          userType: 'EMPLOYEE',
          active: true,
          companyId: '',
          companyGroupId: ''
        })
      }
    }
  }, [isOpen, mode, user])

  const fetchCompanies = async () => {
    try {
      const response = await fetch('/api/companies')
      if (response.ok) {
        const data = await response.json()
        setCompanies(data)
      }
    } catch (error) {
      console.error('Erro ao carregar empresas:', error)
    }
  }

  const fetchCompanyGroups = async () => {
    try {
      const response = await fetch('/api/company-groups')
      if (response.ok) {
        const data = await response.json()
        setCompanyGroups(data)
      }
    } catch (error) {
      console.error('Erro ao carregar grupos de empresas:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = mode === 'create' ? '/api/users' : `/api/users/${user?.id}`
      const method = mode === 'create' ? 'POST' : 'PATCH'
      
      const body: any = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone || null,
        userType: formData.userType,
        active: formData.active
      }

      // Adicionar senha apenas na criação ou se foi preenchida na edição
      if (mode === 'create' || formData.password) {
        body.password = formData.password
      }

      // Adicionar relacionamentos baseado no tipo de usuário
      if (formData.userType === 'COMPANY_GROUP' && formData.companyGroupId) {
        body.companyGroupId = formData.companyGroupId
      } else if (['COMPANY', 'EMPLOYEE'].includes(formData.userType) && formData.companyId) {
        body.companyId = formData.companyId
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao salvar usuário')
      }

      onSave()
      onClose()
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Erro ao salvar usuário')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {mode === 'create' ? 'Criar Usuário' : 'Editar Usuário'}
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Nome */}
          <div>
            <Label htmlFor="name">Nome *</Label>
            <div className="relative mt-1">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Nome completo"
                className="pl-10"
                required
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <Label htmlFor="email">Email *</Label>
            <div className="relative mt-1">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="email@exemplo.com"
                className="pl-10"
                required
              />
            </div>
          </div>

          {/* Telefone */}
          <div>
            <Label htmlFor="phone">Telefone</Label>
            <div className="relative mt-1">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="(11) 99999-9999"
                className="pl-10"
              />
            </div>
          </div>

          {/* Senha */}
          <div>
            <Label htmlFor="password">
              {mode === 'create' ? 'Senha *' : 'Nova Senha (deixe vazio para manter)'}
            </Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => handleChange('password', e.target.value)}
              placeholder="••••••••"
              required={mode === 'create'}
            />
          </div>

          {/* Tipo de Usuário */}
          <div>
            <Label>Tipo de Usuário *</Label>
            <div className="grid grid-cols-2 gap-3 mt-2">
              {userTypes.map((type) => {
                const Icon = type.icon
                const isSelected = formData.userType === type.value
                
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => handleChange('userType', type.value)}
                    className={cn(
                      'flex items-center p-3 border rounded-lg transition-colors text-left',
                      isSelected
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:border-gray-400'
                    )}
                  >
                    <Icon className={cn('h-5 w-5 mr-3', isSelected ? 'text-blue-600' : type.color)} />
                    <span className="font-medium">{type.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Grupo de Empresas (para COMPANY_GROUP) */}
          {formData.userType === 'COMPANY_GROUP' && (
            <div>
              <Label htmlFor="companyGroupId">Grupo de Empresas</Label>
              <select
                id="companyGroupId"
                value={formData.companyGroupId}
                onChange={(e) => handleChange('companyGroupId', e.target.value)}
                className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Selecione um grupo</option>
                {companyGroups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Empresa (para COMPANY e EMPLOYEE) */}
          {['COMPANY', 'EMPLOYEE'].includes(formData.userType) && (
            <div>
              <Label htmlFor="companyId">Empresa</Label>
              <select
                id="companyId"
                value={formData.companyId}
                onChange={(e) => handleChange('companyId', e.target.value)}
                className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Selecione uma empresa</option>
                {companies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Status */}
          <div className="flex items-center space-x-2">
            <input
              id="active"
              type="checkbox"
              checked={formData.active}
              onChange={(e) => handleChange('active', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <Label htmlFor="active">Usuário ativo</Label>
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="bg-red-600 hover:bg-red-700">
              {loading ? (
                <div className="flex items-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Salvando...
                </div>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {mode === 'create' ? 'Criar' : 'Salvar'}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}