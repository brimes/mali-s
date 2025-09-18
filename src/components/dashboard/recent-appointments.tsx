'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Clock, User, Scissors, Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

interface Agendamento {
  id: string
  cliente: string
  funcionario: string
  servico: string
  horario: string
  status: string
  tempoRestante: string
}

export function RecentAppointments() {
  const { data: session, status } = useSession()
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return
    if (status === 'unauthenticated') {
      setError('Usuário não autenticado')
      setLoading(false)
      return
    }

    const fetchAgendamentos = async () => {
      try {
        const response = await fetch('/api/dashboard/upcoming-appointments')
        if (response.status === 401) {
          setError('Usuário não autenticado')
          return
        }
        if (!response.ok) {
          throw new Error('Erro ao buscar agendamentos')
        }
        const data = await response.json()
        setAgendamentos(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido')
      } finally {
        setLoading(false)
      }
    }

    fetchAgendamentos()
  }, [status])

  const handleVerTodos = () => {
    router.push('/agendamentos')
  }
  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base lg:text-lg">
          <Clock className="h-4 w-4 lg:h-5 lg:w-5" />
          Próximos Agendamentos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 lg:space-y-4">
        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-32"></div>
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-24"></div>
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-20"></div>
                </div>
                <div className="text-right">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-12 mb-1"></div>
                  <div className="h-6 bg-gray-200 rounded animate-pulse w-16"></div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center text-red-600 p-4">
            Erro ao carregar agendamentos: {error}
          </div>
        ) : agendamentos.length === 0 ? (
          <div className="text-center text-gray-500 p-4">
            Nenhum agendamento encontrado
          </div>
        ) : (
          agendamentos.map((agendamento) => (
            <div
              key={agendamento.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border rounded-lg gap-3 sm:gap-0"
            >
              <div className="space-y-1 flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <User className="h-3 w-3 lg:h-4 lg:w-4 text-gray-500 flex-shrink-0" />
                  <span className="font-medium text-sm lg:text-base truncate">{agendamento.cliente}</span>
                </div>
                <div className="flex items-center gap-2 text-xs lg:text-sm text-gray-600">
                  <Scissors className="h-3 w-3 lg:h-4 lg:w-4 flex-shrink-0" />
                  <span className="truncate">{agendamento.servico}</span>
                </div>
                <div className="text-xs lg:text-sm text-gray-500 truncate">
                  com {agendamento.funcionario}
                </div>
              </div>
              <div className="text-left sm:text-right flex-shrink-0">
                <div className="font-medium text-sm lg:text-base">{agendamento.horario}</div>
                <div className="text-xs lg:text-sm text-blue-600 font-medium">
                  {agendamento.tempoRestante}
                </div>
                <div className={`text-xs lg:text-sm px-2 py-1 rounded-full inline-block mt-1 ${
                  agendamento.status === 'agendado' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-green-100 text-green-800'
                }`}>
                  {agendamento.status === 'agendado' ? 'Agendado' : 'Concluído'}
                </div>
              </div>
            </div>
          ))
        )}
        <Button onClick={handleVerTodos} className="w-full mt-3 lg:mt-4 text-sm lg:text-base">
          Ver Todos os Agendamentos
        </Button>
      </CardContent>
    </Card>
  )
}