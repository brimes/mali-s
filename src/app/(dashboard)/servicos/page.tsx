'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Plus, Clock, DollarSign, Search, Filter, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'

interface Servico {
  id: string
  nome: string
  descricao: string | null
  duracao: number
  preco: number
  categoria: string
  ativo: boolean
  agendamentos: any[]
}

export default function ServicosPage() {
  const [servicos, setServicos] = useState<Servico[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filtroCategoria, setFiltroCategoria] = useState('todas')
  const [filtroStatus, setFiltroStatus] = useState('todos')

  useEffect(() => {
    fetchServicos()
  }, [])

  const fetchServicos = async () => {
    try {
      const response = await fetch('/api/servicos')
      if (!response.ok) {
        throw new Error('Erro ao buscar serviços')
      }
      const data = await response.json()
      setServicos(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price)
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours === 0) return `${mins}min`
    if (mins === 0) return `${hours}h`
    return `${hours}h${mins}min`
  }

  const getCategoriaLabel = (categoria: string) => {
    const labels: {[key: string]: string} = {
      'cabelo': 'Cabelo',
      'unha': 'Unha',
      'sobrancelha': 'Sobrancelha',
      'depilacao': 'Depilação',
      'estetica': 'Estética',
      'tratamento': 'Tratamento'
    }
    return labels[categoria] || categoria
  }

  const filteredServicos = servicos.filter(servico => {
    const matchesSearch = servico.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (servico.descricao && servico.descricao.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesCategoria = filtroCategoria === 'todas' || servico.categoria === filtroCategoria
    const matchesStatus = filtroStatus === 'todos' || 
                         (filtroStatus === 'ativo' && servico.ativo) ||
                         (filtroStatus === 'inativo' && !servico.ativo)
    
    return matchesSearch && matchesCategoria && matchesStatus
  })

  const categorias = Array.from(new Set(servicos.map(s => s.categoria)))

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Serviços</h1>
          <p className="text-sm lg:text-base text-gray-600">Gerencie os serviços oferecidos</p>
        </div>
        <Link href="/servicos/novo">
          <Button className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Novo Serviço
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
                placeholder="Buscar por nome ou descrição..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category and Status Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <select
                  value={filtroCategoria}
                  onChange={(e) => setFiltroCategoria(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="todas">Todas as categorias</option>
                  {categorias.map(categoria => (
                    <option key={categoria} value={categoria}>
                      {getCategoriaLabel(categoria)}
                    </option>
                  ))}
                </select>
              </div>
              
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
          </div>
        </CardContent>
      </Card>

      {/* Services List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base lg:text-lg">
            Lista de Serviços
            {!loading && (
              <span className="text-sm font-normal text-gray-500 ml-2">
                ({filteredServicos.length} {filteredServicos.length === 1 ? 'serviço' : 'serviços'})
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
              <p>Erro ao carregar serviços: {error}</p>
              <Button onClick={fetchServicos} className="mt-4">
                Tentar Novamente
              </Button>
            </div>
          ) : filteredServicos.length === 0 ? (
            <div className="text-center text-gray-500 p-8">
              {servicos.length === 0 ? (
                <div>
                  <p className="mb-4">Nenhum serviço cadastrado ainda.</p>
                  <Link href="/servicos/novo">
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Cadastrar Primeiro Serviço
                    </Button>
                  </Link>
                </div>
              ) : (
                <p>Nenhum serviço encontrado com os filtros aplicados.</p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredServicos.map((servico) => (
                <div
                  key={servico.id}
                  className="flex flex-col lg:flex-row lg:items-center justify-between p-4 border rounded-lg hover:bg-gray-50 gap-4"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-gray-900 text-sm lg:text-base">{servico.nome}</h3>
                      <Badge variant={servico.ativo ? "default" : "secondary"}>
                        {servico.ativo ? 'Ativo' : 'Inativo'}
                      </Badge>
                      <Badge variant="outline">
                        {getCategoriaLabel(servico.categoria)}
                      </Badge>
                    </div>
                    
                    {servico.descricao && (
                      <p className="text-sm text-gray-600">{servico.descricao}</p>
                    )}
                    
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {formatDuration(servico.duracao)}
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        {formatPrice(servico.preco)}
                      </div>
                      <div className="text-gray-500">
                        {servico.agendamentos.length} {servico.agendamentos.length === 1 ? 'agendamento' : 'agendamentos'}
                      </div>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
                    <Link href={`/servicos/${servico.id}`} className="flex-1 lg:flex-none">
                      <Button variant="outline" size="sm" className="w-full lg:w-auto text-xs lg:text-sm">
                        Ver Detalhes
                      </Button>
                    </Link>
                    <Link href={`/servicos/${servico.id}/editar`} className="flex-1 lg:flex-none">
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