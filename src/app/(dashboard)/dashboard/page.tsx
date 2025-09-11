'use client'

import { DashboardStats } from '@/components/dashboard/dashboard-stats'
import { RecentAppointments } from '@/components/dashboard/recent-appointments'
import { QuickActions } from '@/components/dashboard/quick-actions'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Shield } from 'lucide-react'

export default function DashboardPage() {
  const { data: session } = useSession()

  const getUserTypeTitle = (userType: string) => {
    switch (userType) {
      case 'ADMIN':
        return 'Painel Administrativo'
      case 'COMPANY_GROUP':
        return 'Gerenciamento da Rede'
      case 'COMPANY':
        return 'Gerenciamento da Loja'
      case 'EMPLOYEE':
        return 'Painel do Funcionário'
      default:
        return 'Dashboard'
    }
  }

  const getUserTypeDescription = (userType: string) => {
    switch (userType) {
      case 'ADMIN':
        return 'Controle total do sistema e todas as empresas'
      case 'COMPANY_GROUP':
        return 'Visão geral de todas as lojas da rede'
      case 'COMPANY':
        return 'Controle completo da sua loja'
      case 'EMPLOYEE':
        return 'Seus agendamentos e informações'
      default:
        return 'Visão geral do salão de beleza'
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          {session?.user ? getUserTypeTitle(session.user.userType) : 'Dashboard'}
        </h1>
        <p className="text-gray-600">
          {session?.user ? getUserTypeDescription(session.user.userType) : 'Visão geral do salão de beleza'}
        </p>
        {session?.user?.company && (
          <p className="text-sm text-purple-600 mt-1">
            📍 {session.user.company.name}
          </p>
        )}
        {session?.user?.companyGroup && (
          <p className="text-sm text-blue-600 mt-1">
            🏢 {session.user.companyGroup.name}
          </p>
        )}
      </div>
      
      {/* Link para área administrativa */}
      {session?.user?.userType === 'ADMIN' && (
        <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-red-900 flex items-center">
                <Shield className="mr-2 h-5 w-5" />
                Área Administrativa
              </h3>
              <p className="text-red-700 mt-1">
                Acesse o painel administrativo para gerenciar o sistema completo
              </p>
            </div>
            <Link href="/admin">
              <Button className="bg-red-600 hover:bg-red-700">
                <Shield className="mr-2 h-4 w-4" />
                Acessar Admin
              </Button>
            </Link>
          </div>
        </div>
      )}
      
      <DashboardStats />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentAppointments />
        <QuickActions />
      </div>
    </div>
  )
}