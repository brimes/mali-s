'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Calendar, Scissors, DollarSign } from 'lucide-react'

// Mock data - Em produção, buscar do banco de dados
const stats = {
  totalClientes: 156,
  agendamentosHoje: 12,
  totalServicos: 25,
  faturamentoMes: 15650.00
}

export function DashboardStats() {
  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statsData.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {stat.title}
            </CardTitle>
            <div className={`p-2 rounded-full ${stat.bgColor}`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}