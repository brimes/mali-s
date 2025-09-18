'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Edit, Clock, DollarSign, Calendar, Users, Loader2 } from 'lucide-react'
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
  createdAt: string
  agendamentos: Array<{
    id: string
    dataHora: string
    status: string
    cliente: {
      nome: string
    }
    funcionario: {
      nome: string
    }
  }>
}

interface ServicoDetalhesProps {
  params: {
    id: string
  }
}

export default function ServicoDetalhesPage({ params }: ServicoDetalhesProps) {
  const [servico, setServico] = useState<Servico | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetchServico()
  }, [params.id])

  const fetchServico = async () => {
    try {
      const response = await fetch(`/api/servicos/${params.id}`)
      if (!response.ok) {
        throw new Error('Serviço não encontrado')
      }
      const data = await response.json()
      setServico(data)
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'agendado':
        return 'bg-blue-100 text-blue-800'
      case 'concluido':
        return 'bg-green-100 text-green-800'
      case 'cancelado':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error || !servico) {
    return (
      <div className="space-y-4">
        <Link href="/servicos">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </Link>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-red-600">
              {error || 'Serviço não encontrado'}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/servicos">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">{servico.nome}</h1>
            <p className="text-sm lg:text-base text-gray-600">Detalhes do serviço</p>
          </div>
        </div>
        <Link href={`/servicos/${servico.id}/editar`}>
          <Button className="w-full sm:w-auto">
            <Edit className="h-4 w-4 mr-2" />
            Editar Serviço
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Informações do Serviço */}
        <div className="xl:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informações do Serviço</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-gray-500" />
                <span>{formatDuration(servico.duracao)}</span>
              </div>
              
              <div className="flex items-center gap-3">
                <DollarSign className="h-4 w-4 text-gray-500" />
                <span className="text-lg font-semibold text-green-600">{formatPrice(servico.preco)}</span>
              </div>
              
              <div className="flex items-center gap-3">
                <Badge variant="outline">
                  {getCategoriaLabel(servico.categoria)}
                </Badge>
                <Badge variant={servico.ativo ? "default" : "secondary"}>
                  {servico.ativo ? 'Ativo' : 'Inativo'}
                </Badge>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span>Criado em {formatDate(servico.createdAt).split(' ')[0]}</span>
              </div>

              {servico.descricao && (
                <div className="pt-4 border-t">
                  <h4 className="font-medium text-gray-900 mb-2">Descrição</h4>
                  <p className="text-gray-600 text-sm">{servico.descricao}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Histórico de Agendamentos */}
        <div className="xl:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Histórico de Agendamentos
                <span className="text-sm font-normal text-gray-500 ml-2">
                  ({servico.agendamentos.length} {servico.agendamentos.length === 1 ? 'agendamento' : 'agendamentos'})
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {servico.agendamentos.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Nenhum agendamento encontrado para este serviço</p>
                  <Link href="/agendamentos" className="inline-block mt-2">
                    <Button size="sm">
                      Criar Agendamento
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {servico.agendamentos.map((agendamento) => (
                    <div
                      key={agendamento.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg gap-3"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Users className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">{agendamento.cliente.nome}</span>
                          <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(agendamento.status)}`}>
                            {agendamento.status.charAt(0).toUpperCase() + agendamento.status.slice(1)}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 ml-6">
                          com {agendamento.funcionario.nome}
                        </div>
                        <div className="text-sm text-gray-600 ml-6">
                          {formatDate(agendamento.dataHora)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}