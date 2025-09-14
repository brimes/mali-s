'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Building2, Plus, BarChart3, X } from 'lucide-react'
import { useState, useEffect } from 'react'

interface CompanyGroup {
  id: string
  name: string
  description?: string
  active: boolean
  createdAt: string
  updatedAt: string
  companies: {
    id: string
    name: string
    active: boolean
  }[]
  _count: {
    companies: number
    users: number
  }
}

export default function AdminCompanyGroupsPage() {
  const [companyGroups, setCompanyGroups] = useState<CompanyGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showCompaniesModal, setShowCompaniesModal] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState<CompanyGroup | null>(null)
  const [creating, setCreating] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  })

  useEffect(() => {
    fetchCompanyGroups()
  }, [])

  const fetchCompanyGroups = async () => {
    try {
      const response = await fetch('/api/company-groups')
      if (response.ok) {
        const data = await response.json()
        setCompanyGroups(data)
      }
    } catch (error) {
      console.error('Erro ao carregar grupos:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)
    setError(null)

    try {
      const response = await fetch('/api/company-groups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setShowCreateModal(false)
        setFormData({ name: '', description: '' })
        fetchCompanyGroups() // Recarregar lista
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Erro ao criar grupo')
      }
    } catch (error) {
      console.error('Erro ao criar grupo:', error)
      setError('Erro ao criar grupo')
    } finally {
      setCreating(false)
    }
  }

  const handleEditGroup = (group: CompanyGroup) => {
    setSelectedGroup(group)
    setFormData({
      name: group.name,
      description: group.description || ''
    })
    setError(null)
    setShowEditModal(true)
  }

  const handleUpdateGroup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedGroup) return
    
    setUpdating(true)
    setError(null)

    try {
      const response = await fetch(`/api/company-groups/${selectedGroup.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setShowEditModal(false)
        setSelectedGroup(null)
        setFormData({ name: '', description: '' })
        fetchCompanyGroups() // Recarregar lista
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Erro ao atualizar grupo')
      }
    } catch (error) {
      console.error('Erro ao atualizar grupo:', error)
      setError('Erro ao atualizar grupo')
    } finally {
      setUpdating(false)
    }
  }

  const handleViewCompanies = (group: CompanyGroup) => {
    setSelectedGroup(group)
    setShowCompaniesModal(true)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'short'
    })
  }

  const totalCompanies = companyGroups.reduce((acc, group) => acc + group._count.companies, 0)
  const activeGroups = companyGroups.filter(group => group.active).length

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Grupos de Empresas</h1>
            <p className="text-gray-600">Gerenciar redes e franquias</p>
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
          <h1 className="text-3xl font-bold text-gray-900">Grupos de Empresas</h1>
          <p className="text-gray-600">Gerenciar redes e franquias</p>
        </div>
        <Button 
          className="bg-red-600 hover:bg-red-700"
          onClick={() => setShowCreateModal(true)}
        >
          <Plus className="mr-2 h-4 w-4" />
          Criar Grupo
        </Button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Grupos</p>
                <p className="text-3xl font-bold text-purple-600">{companyGroups.length}</p>
              </div>
              <Building2 className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Empresas Totais</p>
                <p className="text-3xl font-bold text-blue-600">{totalCompanies}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Grupos Ativos</p>
                <p className="text-3xl font-bold text-green-600">{activeGroups}</p>
              </div>
              <Building2 className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Grupos */}
      <Card>
        <CardHeader>
          <CardTitle>Grupos Existentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {companyGroups.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Building2 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Nenhum grupo de empresas encontrado</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setShowCreateModal(true)}
                >
                  Criar Primeiro Grupo
                </Button>
              </div>
            ) : (
              companyGroups.map((group) => (
                <div key={group.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">{group.name}</h3>
                      {group.description && (
                        <p className="text-gray-600">{group.description}</p>
                      )}
                      <div className="flex items-center mt-2 space-x-4 text-sm text-gray-500">
                        <span>{group._count.companies} empresas</span>
                        <span>•</span>
                        <span>{group.active ? 'Ativo' : 'Inativo'}</span>
                        <span>•</span>
                        <span>Criado em {formatDate(group.createdAt)}</span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditGroup(group)}
                      >
                        Editar
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewCompanies(group)}
                      >
                        Ver Empresas
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modal de Criar Grupo */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Criar Novo Grupo</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCreateModal(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <form onSubmit={handleCreateGroup} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
                  {error}
                </div>
              )}
              
              <div>
                <Label htmlFor="name">Nome do Grupo</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Rede Beleza Total"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Descrição (opcional)</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descrição do grupo de empresas"
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateModal(false)}
                  disabled={creating}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="bg-red-600 hover:bg-red-700"
                  disabled={creating}
                >
                  {creating ? 'Criando...' : 'Criar Grupo'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Editar Grupo */}
      {showEditModal && selectedGroup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Editar Grupo</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowEditModal(false)
                  setSelectedGroup(null)
                  setFormData({ name: '', description: '' })
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <form onSubmit={handleUpdateGroup} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
                  {error}
                </div>
              )}
              
              <div>
                <Label htmlFor="edit-name">Nome do Grupo</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Rede Beleza Total"
                  required
                />
              </div>

              <div>
                <Label htmlFor="edit-description">Descrição (opcional)</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descrição do grupo de empresas"
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowEditModal(false)
                    setSelectedGroup(null)
                    setFormData({ name: '', description: '' })
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

      {/* Modal de Ver Empresas */}
      {showCompaniesModal && selectedGroup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                Empresas do Grupo: {selectedGroup.name}
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowCompaniesModal(false)
                  setSelectedGroup(null)
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-4">
              {selectedGroup.companies.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Building2 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Nenhuma empresa encontrada neste grupo</p>
                </div>
              ) : (
                selectedGroup.companies.map((company) => (
                  <div key={company.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{company.name}</h3>
                        <p className="text-sm text-gray-500">
                          Status: {company.active ? 'Ativa' : 'Inativa'}
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        Ver Detalhes
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-end pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowCompaniesModal(false)
                  setSelectedGroup(null)
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