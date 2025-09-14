import { AdminPanel } from '@/components/dashboard/admin-panel'

export default function AdminDashboardPage() {
  return (
    <div className="space-y-4 lg:space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Painel Administrativo</h1>
        <p className="text-sm lg:text-base text-gray-600">Controle total do sistema Mali-S</p>
      </div>
      
      <AdminPanel />
    </div>
  )
}