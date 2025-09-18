'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Calendar, Scissors, DollarSign, Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'

interface StatsData {
  totalClientes: number
  agendamentosHoje: number
  totalServicos: number
  faturamentoMes: number
}

export function DashboardStats() {
  const { data: session, status } = useSession()
  const [stats, setStats] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'loading') return
    if (status === 'unauthenticated') {
      setError('Usuário não autenticado')
      setLoading(false)
      return
    }

    const fetchStats = async () => {
      try {
        const response = await fetch('/api/dashboard/stats')
        if (response.status === 401) {
          setError('Usuário não autenticado')
          return
        }
        if (!response.ok) {
          throw new Error('Erro ao buscar estatísticas')
        }
        const data = await response.json()
        setStats(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido')
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [status])
  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {[...Array(4)].map((_, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-600 leading-tight">
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              </CardTitle>
              <div className="p-2 rounded-full bg-gray-100 flex-shrink-0">
                <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 animate-spin" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <Card className="col-span-full">
          <CardContent className="pt-6">
            <div className="text-center text-red-600">
              Erro ao carregar estatísticas: {error}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!stats) {
    return null
  }

  const statsData = [
    {
      title: 'Total de Clientes',
      value: stats.totalClientes.toString(),
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Agendamentos Hoje',
      value: stats.agendamentosHoje.toString(),
      icon: Calendar,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Serviços Ativos',
      value: stats.totalServicos.toString(),
      icon: Scissors,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'Faturamento do Mês',
      value: formatPrice(stats.faturamentoMes),
      icon: DollarSign,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    }
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
      {statsData.map((stat, index) => (
        <Card key={index} className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-gray-600 leading-tight">
              {stat.title}
            </CardTitle>
            <div className={`p-2 rounded-full ${stat.bgColor} flex-shrink-0`}>
              <stat.icon className={`h-3 w-3 sm:h-4 sm:w-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 break-words">
              {stat.value}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}