'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Building, Plus, Users, Calendar, Scissors, X } from 'lucide-react'
import { useState, useEffect } from 'react'

interface Company {
  id: string
  name: string
  cnpj?: string
  phone?: string
  email?: string
  address?: string
  city?: string
  state?: string
  zipCode?: string
  active: boolean
  createdAt: string
  updatedAt: string
  companyGroup?: {
    id: string
    name: string
  }
  _count: {
    users: number
    clientes: number
    funcionarios: number
    servicos: number
    agendamentos: number
  }
}

interface CompanyGroup {
  id: string
  name: string
}

export default function AdminCompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [companyGroups, setCompanyGroups] = useState<CompanyGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
  const [creating, setCreating] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    cnpj: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    companyGroupId: ''
  })

  useEffect(() => {
    fetchCompanies()
    fetchCompanyGroups()
  }, [])

  const fetchCompanies = async () => {
    try {
      const response = await fetch('/api/companies')
      if (response.ok) {
        const data = await response.json()
        setCompanies(data)
      }
    } catch (error) {
      console.error('Erro ao carregar empresas:', error)
    } finally {
      setLoading(false)
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
      console.error('Erro ao carregar grupos:', error)
    }
  }

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)
    setError(null)

    try {
      const response = await fetch('/api/companies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          companyGroupId: formData.companyGroupId || undefined
        }),
      })

      if (response.ok) {
        setShowCreateModal(false)
        resetForm()
        fetchCompanies()
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Erro ao criar empresa')
      }
    } catch (error) {
      console.error('Erro ao criar empresa:', error)
      setError('Erro ao criar empresa')
    } finally {
      setCreating(false)
    }
  }

  const handleEditCompany = (company: Company) => {
    setSelectedCompany(company)
    setFormData({
      name: company.name,
      cnpj: company.cnpj || '',
      phone: company.phone || '',
      email: company.email || '',
      address: company.address || '',
      city: company.city || '',
      state: company.state || '',
      zipCode: company.zipCode || '',
      companyGroupId: company.companyGroup?.id || ''
    })
    setError(null)
    setShowEditModal(true)
  }

  const handleUpdateCompany = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCompany) return
    
    setUpdating(true)
    setError(null)

    try {
      const response = await fetch(`/api/companies/${selectedCompany.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          companyGroupId: formData.companyGroupId || undefined
        }),
      })

      if (response.ok) {
        setShowEditModal(false)
        setSelectedCompany(null)
        resetForm()
        fetchCompanies()
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Erro ao atualizar empresa')
      }
    } catch (error) {
      console.error('Erro ao atualizar empresa:', error)
      setError('Erro ao atualizar empresa')
    } finally {
      setUpdating(false)
    }
  }

  const handleViewDetails = (company: Company) => {
    setSelectedCompany(company)
    setShowDetailsModal(true)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      cnpj: '',
      phone: '',
      email: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      companyGroupId: ''
    })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const totalClients = companies.reduce((acc, company) => acc + company._count.clientes, 0)
  const totalAppointments = companies.reduce((acc, company) => acc + company._count.agendamentos, 0)
  const totalServices = companies.reduce((acc, company) => acc + company._count.servicos, 0)

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gerenciar Empresas</h1>
            <p className="text-gray-600">Controle de todas as empresas do sistema</p>
          </div>
        </div>
        <div className="text-center py-8">
          <p className="text-gray-500">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gerenciar Empresas</h1>
          <p className="text-gray-600">Controle de todas as empresas do sistema</p>
        </div>
        <Button 
          className="bg-red-600 hover:bg-red-700"
          onClick={() => setShowCreateModal(true)}
        >
          <Plus className="mr-2 h-4 w-4" />
          Criar Empresa
        </Button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Empresas</p>
                <p className="text-3xl font-bold text-blue-600">{companies.length}</p>
              </div>
              <Building className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Clientes Totais</p>
                <p className="text-3xl font-bold text-green-600">{totalClients}</p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Agendamentos</p>
                <p className="text-3xl font-bold text-purple-600">{totalAppointments}</p>
              </div>
              <Calendar className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Serviços Totais</p>
                <p className="text-3xl font-bold text-orange-600">{totalServices}</p>
              </div>
              <Scissors className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Empresas */}
      <Card>
        <CardHeader>
          <CardTitle>Empresas Cadastradas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {companies.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Building className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Nenhuma empresa encontrada</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setShowCreateModal(true)}
                >
                  Criar Primeira Empresa
                </Button>
              </div>
            ) : (
              companies.map((company) => (
                <div key={company.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">{company.name}</h3>
                      <p className="text-gray-600">
                        {company.address ? `${company.address}${company.city ? ` - ${company.city}` : ''}${company.state ? `, ${company.state}` : ''}` : 'Endereço não informado'}
                      </p>
                      <div className="flex items-center mt-2 space-x-4 text-sm text-gray-500">
                        {company.cnpj && (
                          <>
                            <span>CNPJ: {company.cnpj}</span>
                            <span>•</span>
                          </>
                        )}
                        {company.companyGroup && (
                          <>
                            <span>{company.companyGroup.name}</span>
                            <span>•</span>
                          </>
                        )}
                        <span className={company.active ? 'text-green-600' : 'text-red-600'}>
                          {company.active ? 'Ativo' : 'Inativo'}
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewDetails(company)}
                      >
                        Ver Detalhes
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditCompany(company)}
                      >
                        Editar
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modal de Criar Empresa */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Criar Nova Empresa</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowCreateModal(false)
                  resetForm()
                  setError(null)
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <form onSubmit={handleCreateCompany} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
                  {error}
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nome da Empresa *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Salão Beleza Total"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="cnpj">CNPJ</Label>
                  <Input
                    id="cnpj"
                    value={formData.cnpj}
                    onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                    placeholder="00.000.000/0000-00"
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="(11) 99999-9999"
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="contato@empresa.com"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="address">Endereço</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Rua das Flores, 123"
                  />
                </div>

                <div>
                  <Label htmlFor="city">Cidade</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="São Paulo"
                  />
                </div>

                <div>
                  <Label htmlFor="state">Estado</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    placeholder="SP"
                  />
                </div>

                <div>
                  <Label htmlFor="zipCode">CEP</Label>
                  <Input
                    id="zipCode"
                    value={formData.zipCode}
                    onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                    placeholder="00000-000"
                  />
                </div>

                <div>
                  <Label htmlFor="companyGroupId">Grupo de Empresas</Label>
                  <select
                    id="companyGroupId"
                    value={formData.companyGroupId}
                    onChange={(e) => setFormData({ ...formData, companyGroupId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="">Selecione um grupo (opcional)</option>
                    {companyGroups.map((group) => (
                      <option key={group.id} value={group.id}>
                        {group.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowCreateModal(false)
                    resetForm()
                    setError(null)
                  }}
                  disabled={creating}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="bg-red-600 hover:bg-red-700"
                  disabled={creating}
                >
                  {creating ? 'Criando...' : 'Criar Empresa'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Editar Empresa */}
      {showEditModal && selectedCompany && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Editar Empresa</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowEditModal(false)
                  setSelectedCompany(null)
                  resetForm()
                  setError(null)
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <form onSubmit={handleUpdateCompany} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
                  {error}
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-name">Nome da Empresa *</Label>
                  <Input
                    id="edit-name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Salão Beleza Total"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="edit-cnpj">CNPJ</Label>
                  <Input
                    id="edit-cnpj"
                    value={formData.cnpj}
                    onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                    placeholder="00.000.000/0000-00"
                  />
                </div>

                <div>
                  <Label htmlFor="edit-phone">Telefone</Label>
                  <Input
                    id="edit-phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="(11) 99999-9999"
                  />
                </div>

                <div>
                  <Label htmlFor="edit-email">Email</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="contato@empresa.com"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="edit-address">Endereço</Label>
                  <Input
                    id="edit-address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Rua das Flores, 123"
                  />
                </div>

                <div>
                  <Label htmlFor="edit-city">Cidade</Label>
                  <Input
                    id="edit-city"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="São Paulo"
                  />
                </div>

                <div>
                  <Label htmlFor="edit-state">Estado</Label>
                  <Input
                    id="edit-state"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    placeholder="SP"
                  />
                </div>

                <div>
                  <Label htmlFor="edit-zipCode">CEP</Label>
                  <Input
                    id="edit-zipCode"
                    value={formData.zipCode}
                    onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                    placeholder="00000-000"
                  />
                </div>

                <div>
                  <Label htmlFor="edit-companyGroupId">Grupo de Empresas</Label>
                  <select
                    id="edit-companyGroupId"
                    value={formData.companyGroupId}
                    onChange={(e) => setFormData({ ...formData, companyGroupId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="">Selecione um grupo (opcional)</option>
                    {companyGroups.map((group) => (
                      <option key={group.id} value={group.id}>
                        {group.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowEditModal(false)
                    setSelectedCompany(null)
                    resetForm()
                    setError(null)
                  }}
                  disabled={updating}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="bg-red-600 hover:bg-red-700"
                  disabled={updating}
                >
                  {updating ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Ver Detalhes */}
      {showDetailsModal && selectedCompany && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Detalhes da Empresa</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowDetailsModal(false)
                  setSelectedCompany(null)
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-6">
              {/* Informações Básicas */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Informações Básicas</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Nome</Label>
                    <p className="text-gray-900">{selectedCompany.name}</p>
                  </div>
                  {selectedCompany.cnpj && (
                    <div>
                      <Label className="text-sm font-medium text-gray-600">CNPJ</Label>
                      <p className="text-gray-900">{selectedCompany.cnpj}</p>
                    </div>
                  )}
                  {selectedCompany.phone && (
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Telefone</Label>
                      <p className="text-gray-900">{selectedCompany.phone}</p>
                    </div>
                  )}
                  {selectedCompany.email && (
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Email</Label>
                      <p className="text-gray-900">{selectedCompany.email}</p>
                    </div>
                  )}
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Status</Label>
                    <p className={selectedCompany.active ? 'text-green-600' : 'text-red-600'}>
                      {selectedCompany.active ? 'Ativo' : 'Inativo'}
                    </p>
                  </div>
                  {selectedCompany.companyGroup && (
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Grupo</Label>
                      <p className="text-gray-900">{selectedCompany.companyGroup.name}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Endereço */}
              {(selectedCompany.address || selectedCompany.city || selectedCompany.state || selectedCompany.zipCode) && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Endereço</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedCompany.address && (
                      <div className="md:col-span-2">
                        <Label className="text-sm font-medium text-gray-600">Endereço</Label>
                        <p className="text-gray-900">{selectedCompany.address}</p>
                      </div>
                    )}
                    {selectedCompany.city && (
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Cidade</Label>
                        <p className="text-gray-900">{selectedCompany.city}</p>
                      </div>
                    )}
                    {selectedCompany.state && (
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Estado</Label>
                        <p className="text-gray-900">{selectedCompany.state}</p>
                      </div>
                    )}
                    {selectedCompany.zipCode && (
                      <div>
                        <Label className="text-sm font-medium text-gray-600">CEP</Label>
                        <p className="text-gray-900">{selectedCompany.zipCode}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Estatísticas */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Estatísticas</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">{selectedCompany._count.users}</p>
                    <p className="text-sm text-gray-600">Usuários</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">{selectedCompany._count.clientes}</p>
                    <p className="text-sm text-gray-600">Clientes</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <p className="text-2xl font-bold text-purple-600">{selectedCompany._count.funcionarios}</p>
                    <p className="text-sm text-gray-600">Funcionários</p>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <p className="text-2xl font-bold text-orange-600">{selectedCompany._count.servicos}</p>
                    <p className="text-sm text-gray-600">Serviços</p>
                  </div>
                </div>
              </div>

              {/* Datas */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Informações de Sistema</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Criado em</Label>
                    <p className="text-gray-900">{formatDate(selectedCompany.createdAt)}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Última atualização</Label>
                    <p className="text-gray-900">{formatDate(selectedCompany.updatedAt)}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setShowDetailsModal(false)
                  setSelectedCompany(null)
                }}
              >
                Fechar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}