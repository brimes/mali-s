'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, Clock, User, Phone } from 'lucide-react'
import Link from 'next/link'
import { Agendamento } from '@/types/agendamentos'

interface AgendamentosListaProps {
  agendamentos: Agendamento[]
}

export function AgendamentosLista({ agendamentos }: AgendamentosListaProps) {
  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
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

  const getStatusText = (status: string) => {
    switch (status) {
      case 'agendado':
        return 'Agendado'
      case 'concluido':
        return 'Concluído'
      case 'cancelado':
        return 'Cancelado'
      default:
        return status
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base lg:text-lg">Lista de Agendamentos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 lg:space-y-4">
          {agendamentos.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Nenhum agendamento encontrado</p>
            </div>
          ) : (
            agendamentos.map((agendamento) => (
              <div
                key={agendamento.id}
                className="flex flex-col lg:flex-row lg:items-center justify-between p-3 lg:p-4 border rounded-lg hover:bg-gray-50 gap-3 lg:gap-0"
              >
                <div className="space-y-2 flex-1">
                  {/* Date and Status */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3 w-3 lg:h-4 lg:w-4 text-gray-500" />
                      <span className="font-medium text-sm lg:text-base">
                        {formatDateTime(agendamento.dataHora)}
                      </span>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full w-fit ${getStatusColor(agendamento.status)}`}>
                      {getStatusText(agendamento.status)}
                    </span>
                  </div>
                  
                  {/* Client Info */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs lg:text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3 lg:h-4 lg:w-4" />
                      <span className="break-all">{agendamento.cliente.nome}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Phone className="h-3 w-3 lg:h-4 lg:w-4" />
                      <span className="break-all">{agendamento.cliente.telefone}</span>
                    </div>
                  </div>
                  
                  {/* Service Info */}
                  <div className="text-xs lg:text-sm text-gray-600">
                    <strong>{agendamento.servico.nome}</strong> com {agendamento.funcionario.nome}
                  </div>
                  
                  {/* Duration and Price */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs lg:text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3 lg:h-4 lg:w-4" />
                      <span>{agendamento.servico.duracao}min</span>
                    </div>
                    <div className="font-medium">
                      {formatPrice(agendamento.servico.preco)}
                    </div>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto lg:flex-shrink-0">
                  <Link href={`/agendamentos/${agendamento.id}`} className="flex-1 lg:flex-none">
                    <Button variant="outline" size="sm" className="w-full lg:w-auto text-xs lg:text-sm">
                      Ver Detalhes
                    </Button>
                  </Link>
                  {agendamento.status === 'agendado' && (
                    <Link href={`/agendamentos/${agendamento.id}/editar`} className="flex-1 lg:flex-none">
                      <Button variant="outline" size="sm" className="w-full lg:w-auto text-xs lg:text-sm">
                        Editar
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}