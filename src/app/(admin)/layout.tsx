'use client'

import { useState, useEffect } from 'react'
import { AdminSidebar } from '@/components/admin/admin-sidebar'
import { MobileAdminSidebar } from '@/components/admin/mobile-admin-sidebar'
import { MobileHeader } from '@/components/mobile-header'
import { useAuthRequired } from '@/hooks/useAuthRequired'
import { useRouter } from 'next/navigation'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { session, isLoading } = useAuthRequired()
  const router = useRouter()
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  useEffect(() => {
    if (!isLoading && session) {
      // Se não é admin, redirecionar para dashboard
      if (session.user.userType !== 'ADMIN') {
        router.push('/dashboard')
        return
      }
    }
  }, [session, isLoading, router])

  // Mostrar loading enquanto verifica autenticação
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando permissões administrativas...</p>
        </div>
      </div>
    )
  }

  // Se não tem sessão ou não é admin, não renderizar nada (hook vai redirecionar)
  if (!session || session.user.userType !== 'ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 text-xl">⚠️</span>
          </div>
          <p className="text-gray-600">Redirecionando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Desktop Sidebar - Hidden on mobile */}
      <div className="hidden lg:block">
        <AdminSidebar />
      </div>
      
      {/* Mobile Sidebar */}
      <MobileAdminSidebar 
        isOpen={isMobileSidebarOpen} 
        onClose={() => setIsMobileSidebarOpen(false)} 
      />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <MobileHeader 
          onMenuClick={() => setIsMobileSidebarOpen(true)}
          variant="admin"
        />
        
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto p-4 lg:p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}