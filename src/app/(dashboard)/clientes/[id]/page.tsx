'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Edit, Phone, Mail, Calendar, Loader2 } from 'lucide-react'
import Link from 'next/link'

interface Cliente {
  id: string
  nome: string
  telefone: string
  email: string | null
  observacoes: string | null
  createdAt: string
  agendamentos: Array<{
    id: string
    dataHora: string
    status: string
    servico: {
      nome: string
      preco: number
    }
  }>
}

interface ClienteDetalhesProps {
  params: {
    id: string
  }
}

export default function ClienteDetalhesPage({ params }: ClienteDetalhesProps) {
  const [cliente, setCliente] = useState<Cliente | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetchCliente()
  }, [params.id])

  const fetchCliente = async () => {
    try {
      const response = await fetch(`/api/clientes/${params.id}`)
      if (!response.ok) {
        throw new Error('Cliente não encontrado')
      }
      const data = await response.json()
      setCliente(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price)
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

  if (error || !cliente) {
    return (
      <div className="space-y-4">
        <Link href="/clientes">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </Link>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-red-600">
              {error || 'Cliente não encontrado'}
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
          <Link href="/clientes">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">{cliente.nome}</h1>
            <p className="text-sm lg:text-base text-gray-600">Detalhes do cliente</p>
          </div>
        </div>
        <Link href={`/clientes/${cliente.id}/editar`}>
          <Button className="w-full sm:w-auto">
            <Edit className="h-4 w-4 mr-2" />
            Editar Cliente
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Informações do Cliente */}
        <div className="xl:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informações Pessoais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-gray-500" />
                <span>{cliente.telefone}</span>
              </div>
              
              {cliente.email && (
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span>{cliente.email}</span>
                </div>
              )}
              
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span>Cliente desde {formatDate(cliente.createdAt).split(' ')[0]}</span>
              </div>

              {cliente.observacoes && (
                <div className="pt-4 border-t">
                  <h4 className="font-medium text-gray-900 mb-2">Observações</h4>
                  <p className="text-gray-600 text-sm">{cliente.observacoes}</p>
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
                  ({cliente.agendamentos.length} {cliente.agendamentos.length === 1 ? 'agendamento' : 'agendamentos'})
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {cliente.agendamentos.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Nenhum agendamento encontrado</p>
                  <Link href="/agendamentos" className="inline-block mt-2">
                    <Button size="sm">
                      Criar Agendamento
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {cliente.agendamentos
                    .sort((a, b) => new Date(b.dataHora).getTime() - new Date(a.dataHora).getTime())
                    .map((agendamento) => (
                    <div
                      key={agendamento.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg gap-3"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{agendamento.servico.nome}</span>
                          <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(agendamento.status)}`}>
                            {agendamento.status.charAt(0).toUpperCase() + agendamento.status.slice(1)}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          {formatDate(agendamento.dataHora)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-green-600">
                          {formatPrice(agendamento.servico.preco)}
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