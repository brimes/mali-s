'use client'

import { Sidebar } from '@/components/sidebar'
import { useAuthRequired } from '@/hooks/useAuthRequired'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { session, isLoading } = useAuthRequired()

  // Mostrar loading enquanto verifica autenticação
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    )
  }

  // Se não tem sessão, o hook já vai redirecionar
  if (!session) {
    return null
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto p-6">
          {children}
        </div>
      </main>
    </div>
  )
}