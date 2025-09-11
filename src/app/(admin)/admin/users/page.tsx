'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { UserPlus } from 'lucide-react'
import UserStats from '@/components/admin/user-stats'
import UserList from '@/components/admin/user-list'
import UserModal from '@/components/admin/user-modal'
import { useAuthRequired } from '@/hooks/useAuthRequired'

export default function AdminUsersPage() {
  const { session, isLoading } = useAuthRequired()
  const [refreshKey, setRefreshKey] = useState(0)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [selectedUser, setSelectedUser] = useState<any>(null)

  const handleUserUpdate = () => {
    setRefreshKey(prev => prev + 1)
  }

  const handleCreateUser = () => {
    setSelectedUser(null)
    setModalMode('create')
    setModalOpen(true)
  }

  const handleEditUser = (user: any) => {
    setSelectedUser(user)
    setModalMode('edit')
    setModalOpen(true)
  }

  const handleModalSave = () => {
    handleUserUpdate()
    setModalOpen(false)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    )
  }

  if (!session || session.user.userType !== 'ADMIN') {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Acesso negado. Apenas administradores podem acessar esta página.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gerenciar Usuários</h1>
          <p className="text-gray-600">Controle total de usuários do sistema</p>
        </div>
        <Button className="bg-red-600 hover:bg-red-700" onClick={handleCreateUser}>
          <UserPlus className="mr-2 h-4 w-4" />
          Criar Usuário
        </Button>
      </div>

      {/* Estatísticas de Usuários */}
      <UserStats refreshTrigger={refreshKey} />

      {/* Lista de Usuários */}
      <UserList 
        onUserUpdate={handleUserUpdate} 
        refreshTrigger={refreshKey}
        currentUserId={session?.user?.id}
        onEditUser={handleEditUser}
      />

      {/* Modal de Usuário */}
      <UserModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleModalSave}
        user={selectedUser}
        mode={modalMode}
      />
    </div>
  )
}