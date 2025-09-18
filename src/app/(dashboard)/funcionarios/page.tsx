'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Plus, Clock, Users, Search, Phone, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'

interface Funcionario {
  id: string
  nome: string
  telefone: string
  especialidades: string[]
  horarioInicio: string
  horarioFim: string
  diasTrabalho: string[]
  ativo: boolean
  agendamentos: any[]
}

export default function FuncionariosPage() {
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filtroStatus, setFiltroStatus] = useState('todos')

  useEffect(() => {
    fetchFuncionarios()
  }, [])

  const fetchFuncionarios = async () => {
    try {
      const response = await fetch('/api/funcionarios')
      if (!response.ok) {
        throw new Error('Erro ao buscar funcionários')
      }
      const data = await response.json()
      setFuncionarios(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  const getEspecialidadeLabel = (especialidade: string) => {
    const labels: {[key: string]: string} = {
      'corte': 'Corte',
      'pintura': 'Pintura',
      'manicure': 'Manicure',
      'pedicure': 'Pedicure',
      'sobrancelha': 'Sobrancelha',
      'depilacao': 'Depilação',
      'tratamento': 'Tratamento',
      'penteado': 'Penteado',
      'maquiagem': 'Maquiagem'
    }
    return labels[especialidade] || especialidade
  }

  const getDiaLabel = (dia: string) => {
    const labels: {[key: string]: string} = {
      'segunda': 'Seg',
      'terca': 'Ter', 
      'quarta': 'Qua',
      'quinta': 'Qui',
      'sexta': 'Sex',
      'sabado': 'Sáb',
      'domingo': 'Dom'
    }
    return labels[dia] || dia
  }

  const filteredFuncionarios = funcionarios.filter(funcionario => {
    const matchesSearch = funcionario.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         funcionario.telefone.includes(searchTerm) ||
                         funcionario.especialidades.some(esp => 
                           getEspecialidadeLabel(esp).toLowerCase().includes(searchTerm.toLowerCase())
                         )
    
    const matchesStatus = filtroStatus === 'todos' || 
                         (filtroStatus === 'ativo' && funcionario.ativo) ||
                         (filtroStatus === 'inativo' && !funcionario.ativo)
    
    return matchesSearch && matchesStatus
  })
  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Funcionários</h1>
          <p className="text-sm lg:text-base text-gray-600">Gerencie os funcionários do salão</p>
        </div>
        <Link href="/funcionarios/novo">
          <Button className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Novo Funcionário
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por nome, telefone ou especialidade..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Status Filter */}
            <div className="flex-1">
              <select
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="todos">Todos os status</option>
                <option value="ativo">Apenas ativos</option>
                <option value="inativo">Apenas inativos</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Employees List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base lg:text-lg">
            Lista de Funcionários
            {!loading && (
              <span className="text-sm font-normal text-gray-500 ml-2">
                ({filteredFuncionarios.length} {filteredFuncionarios.length === 1 ? 'funcionário' : 'funcionários'})
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-48"></div>
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-64"></div>
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-32"></div>
                  </div>
                  <div className="flex gap-2">
                    <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center text-red-600 p-8">
              <p>Erro ao carregar funcionários: {error}</p>
              <Button onClick={fetchFuncionarios} className="mt-4">
                Tentar Novamente
              </Button>
            </div>
          ) : filteredFuncionarios.length === 0 ? (
            <div className="text-center text-gray-500 p-8">
              {funcionarios.length === 0 ? (
                <div>
                  <p className="mb-4">Nenhum funcionário cadastrado ainda.</p>
                  <Link href="/funcionarios/novo">
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Cadastrar Primeiro Funcionário
                    </Button>
                  </Link>
                </div>
              ) : (
                <p>Nenhum funcionário encontrado com os filtros aplicados.</p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredFuncionarios.map((funcionario) => (
                <div
                  key={funcionario.id}
                  className="flex flex-col lg:flex-row lg:items-center justify-between p-4 border rounded-lg hover:bg-gray-50 gap-4"
                >
                  <div className="space-y-3 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-gray-900 text-sm lg:text-base">{funcionario.nome}</h3>
                      <Badge variant={funcionario.ativo ? "default" : "secondary"}>
                        {funcionario.ativo ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="h-4 w-4" />
                      <span>{funcionario.telefone}</span>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {funcionario.horarioInicio} - {funcionario.horarioFim}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {funcionario.diasTrabalho.length} dias/semana
                      </div>
                      <div className="text-gray-500">
                        {funcionario.agendamentos.length} agendamentos
                      </div>
                    </div>
                    
                    {/* Especialidades */}
                    <div className="space-y-2">
                      <div className="text-xs text-gray-500">Especialidades:</div>
                      <div className="flex flex-wrap gap-1">
                        {funcionario.especialidades.map((esp, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {getEspecialidadeLabel(esp)}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Dias de trabalho */}
                    <div className="space-y-2">
                      <div className="text-xs text-gray-500">Dias de trabalho:</div>
                      <div className="flex flex-wrap gap-1">
                        {funcionario.diasTrabalho.map((dia, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {getDiaLabel(dia)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
                    <Link href={`/funcionarios/${funcionario.id}`} className="flex-1 lg:flex-none">
                      <Button variant="outline" size="sm" className="w-full lg:w-auto text-xs lg:text-sm">
                        Ver Detalhes
                      </Button>
                    </Link>
                    <Link href={`/funcionarios/${funcionario.id}/editar`} className="flex-1 lg:flex-none">
                      <Button variant="outline" size="sm" className="w-full lg:w-auto text-xs lg:text-sm">
                        Editar
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}