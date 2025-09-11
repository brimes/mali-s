'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Users, Shield, Building, Building2 } from 'lucide-react'

interface UserStats {
  total: number
  admins: number
  companyGroups: number
  companies: number
  employees: number
}

interface UserStatsProps {
  refreshTrigger?: number
}

export default function UserStats({ refreshTrigger }: UserStatsProps) {
  const [stats, setStats] = useState<UserStats>({
    total: 0,
    admins: 0,
    companyGroups: 0,
    companies: 0,
    employees: 0
  })
  const [loading, setLoading] = useState(true)

  const fetchStats = async () => {
    try {
      setLoading(true)
      
      // Buscar todos os usuários
      const response = await fetch('/api/users')
      if (!response.ok) {
        throw new Error('Erro ao carregar usuários')
      }
      
      const users = await response.json()
      
      // Calcular estatísticas
      const newStats: UserStats = {
        total: users.length,
        admins: users.filter((u: any) => u.userType === 'ADMIN').length,
        companyGroups: users.filter((u: any) => u.userType === 'COMPANY_GROUP').length,
        companies: users.filter((u: any) => u.userType === 'COMPANY').length,
        employees: users.filter((u: any) => u.userType === 'EMPLOYEE').length
      }
      
      setStats(newStats)
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [refreshTrigger])

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Usuários</p>
              <p className="text-3xl font-bold text-blue-600">
                {loading ? '...' : stats.total}
              </p>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Administradores</p>
              <p className="text-3xl font-bold text-red-600">
                {loading ? '...' : stats.admins}
              </p>
            </div>
            <Shield className="h-8 w-8 text-red-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Gerentes de Grupo</p>
              <p className="text-3xl font-bold text-purple-600">
                {loading ? '...' : stats.companyGroups}
              </p>
            </div>
            <Building2 className="h-8 w-8 text-purple-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Gerentes + Funcionários</p>
              <p className="text-3xl font-bold text-green-600">
                {loading ? '...' : stats.companies + stats.employees}
              </p>
            </div>
            <Building className="h-8 w-8 text-green-600" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}