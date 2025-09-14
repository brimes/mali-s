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
    <div className="space-y-4 lg:space-y-6">
      {/* Header Section */}
      <div className="space-y-2">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
          {session?.user ? getUserTypeTitle(session.user.userType) : 'Dashboard'}
        </h1>
        <p className="text-sm lg:text-base text-gray-600">
          {session?.user ? getUserTypeDescription(session.user.userType) : 'Visão geral do salão de beleza'}
        </p>
        
        {/* Company/Group Info */}
        <div className="flex flex-col sm:flex-row gap-2 text-sm">
          {session?.user?.company && (
            <p className="text-purple-600">
              📍 {session.user.company.name}
            </p>
          )}
          {session?.user?.companyGroup && (
            <p className="text-blue-600">
              🏢 {session.user.companyGroup.name}
            </p>
          )}
        </div>
      </div>
      
      {/* Admin Panel Link - Mobile responsive */}
      {session?.user?.userType === 'ADMIN' && (
        <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-lg p-4 lg:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-base lg:text-lg font-semibold text-red-900 flex items-center">
                <Shield className="mr-2 h-4 w-4 lg:h-5 lg:w-5" />
                Área Administrativa
              </h3>
              <p className="text-sm lg:text-base text-red-700">
                Acesse o painel administrativo para gerenciar o sistema completo
              </p>
            </div>
            <Link href="/admin">
              <Button className="bg-red-600 hover:bg-red-700 w-full sm:w-auto">
                <Shield className="mr-2 h-4 w-4" />
                Acessar Admin
              </Button>
            </Link>
          </div>
        </div>
      )}
      
      {/* Stats Section */}
      <DashboardStats />
      
      {/* Grid Section - Responsive layout */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6">
        <RecentAppointments />
        <QuickActions />
      </div>
    </div>
  )
}