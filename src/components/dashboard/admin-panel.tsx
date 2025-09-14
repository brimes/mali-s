'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Users, 
  Building, 
  Building2, 
  BarChart3, 
  Settings, 
  UserPlus,
  Shield
} from 'lucide-react'

interface StatsData {
  totalUsers: number
  totalCompanies: number
  totalCompanyGroups: number
  totalClients: number
  totalEmployees: number
  totalServices: number
  totalAppointments: number
}

export function AdminPanel() {
  const router = useRouter()
  const [stats, setStats] = useState<StatsData>({
    totalUsers: 0,
    totalCompanies: 0,
    totalCompanyGroups: 0,
    totalClients: 0,
    totalEmployees: 0,
    totalServices: 0,
    totalAppointments: 0
  })
  const [loading, setLoading] = useState(true)

  const handleNavigateToUsers = () => {
    router.push('/admin/users')
  }

  const handleNavigateToCompanies = () => {
    router.push('/admin/companies')
  }

  const handleNavigateToSettings = () => {
    router.push('/admin/settings')
  }

  useEffect(() => {
    // Aqui você pode fazer chamadas para APIs para buscar estatísticas reais
    // Por enquanto, vou usar dados fictícios
    setTimeout(() => {
      setStats({
        totalUsers: 15,
        totalCompanies: 3,
        totalCompanyGroups: 1,
        totalClients: 25,
        totalEmployees: 8,
        totalServices: 12,
        totalAppointments: 45
      })
      setLoading(false)
    }, 1000)
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="mr-2 h-5 w-5 text-purple-600" />
            Painel Administrativo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const adminStats = [
    {
      title: 'Total de Usuários',
      value: stats.totalUsers,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Grupos de Empresas',
      value: stats.totalCompanyGroups,
      icon: Building2,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Empresas',
      value: stats.totalCompanies,
      icon: Building,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Total de Clientes',
      value: stats.totalClients,
      icon: Users,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      title: 'Total de Funcionários',
      value: stats.totalEmployees,
      icon: UserPlus,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50'
    },
    {
      title: 'Total de Serviços',
      value: stats.totalServices,
      icon: Settings,
      color: 'text-pink-600',
      bgColor: 'bg-pink-50'
    },
    {
      title: 'Total de Agendamentos',
      value: stats.totalAppointments,
      icon: BarChart3,
      color: 'text-teal-600',
      bgColor: 'bg-teal-50'
    }
  ]

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header do Painel Admin */}
      <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50">
        <CardHeader>
          <CardTitle className="flex flex-col sm:flex-row sm:items-center gap-3 text-lg lg:text-xl">
            <div className="flex items-center">
              <Shield className="mr-3 h-5 w-5 lg:h-6 lg:w-6 text-purple-600" />
              Painel Administrativo
            </div>
            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full w-fit">
              ADMIN
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm lg:text-base text-gray-600 mb-4">
            Controle total do sistema Mali-S. Gerencie usuários, empresas e monitore estatísticas globais.
          </p>
          <div className="flex flex-col sm:flex-row flex-wrap gap-2">
            <Button size="sm" className="bg-purple-600 hover:bg-purple-700 w-full sm:w-auto" onClick={handleNavigateToUsers}>
              <UserPlus className="mr-2 h-4 w-4" />
              Criar Usuário
            </Button>
            <Button size="sm" variant="outline" className="w-full sm:w-auto" onClick={handleNavigateToCompanies}>
              <Building className="mr-2 h-4 w-4" />
              Gerenciar Empresas
            </Button>
            <Button size="sm" variant="outline" className="w-full sm:w-auto" onClick={handleNavigateToSettings}>
              <Settings className="mr-2 h-4 w-4" />
              Configurações
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas Globais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-base lg:text-lg">
            <BarChart3 className="mr-2 h-4 w-4 lg:h-5 lg:w-5" />
            Estatísticas Globais do Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
            {adminStats.map((stat, index) => (
              <div key={index} className={`p-3 lg:p-4 rounded-lg ${stat.bgColor}`}>
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs lg:text-sm font-medium text-gray-600 truncate">{stat.title}</p>
                    <p className={`text-xl lg:text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                  </div>
                  <stat.icon className={`h-6 w-6 lg:h-8 lg:w-8 ${stat.color} flex-shrink-0 ml-2`} />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Ações Rápidas Admin */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-base lg:text-lg">
              <Users className="mr-2 h-4 w-4 lg:h-5 lg:w-5" />
              Gerenciar Usuários
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start text-sm lg:text-base" variant="outline" onClick={handleNavigateToUsers}>
              <UserPlus className="mr-2 h-4 w-4" />
              Criar Novo Usuário
            </Button>
            <Button className="w-full justify-start text-sm lg:text-base" variant="outline" onClick={handleNavigateToUsers}>
              <Users className="mr-2 h-4 w-4" />
              Listar Todos os Usuários
            </Button>
            <Button className="w-full justify-start text-sm lg:text-base" variant="outline" onClick={handleNavigateToUsers}>
              <Shield className="mr-2 h-4 w-4" />
              Gerenciar Permissões
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-base lg:text-lg">
              <Building2 className="mr-2 h-4 w-4 lg:h-5 lg:w-5" />
              Gerenciar Empresas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start text-sm lg:text-base" variant="outline" onClick={handleNavigateToCompanies}>
              <Building2 className="mr-2 h-4 w-4" />
              Criar Grupo de Empresas
            </Button>
            <Button className="w-full justify-start text-sm lg:text-base" variant="outline" onClick={handleNavigateToCompanies}>
              <Building className="mr-2 h-4 w-4" />
              Criar Nova Empresa
            </Button>
            <Button className="w-full justify-start text-sm lg:text-base" variant="outline" onClick={() => router.push('/admin/reports')}>
              <BarChart3 className="mr-2 h-4 w-4" />
              Relatórios Globais
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}