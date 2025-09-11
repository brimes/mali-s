'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { 
  Users, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Shield, 
  Building, 
  Building2, 
  UserCheck,
  Search,
  Filter
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

// Badge component inline para evitar problemas de importação
interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline'
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const baseStyles = "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors"
  
  const variantStyles = {
    default: "border-transparent bg-blue-600 text-white hover:bg-blue-700",
    secondary: "border-transparent bg-gray-200 text-gray-800 hover:bg-gray-300",
    destructive: "border-transparent bg-red-600 text-white hover:bg-red-700",
    outline: "border-gray-300 text-gray-700 hover:bg-gray-50",
  }
  
  return (
    <div 
      className={cn(baseStyles, variantStyles[variant], className)} 
      {...props} 
    />
  )
}

interface User {
  id: string
  name: string
  email: string
  phone?: string
  userType: 'ADMIN' | 'COMPANY_GROUP' | 'COMPANY' | 'EMPLOYEE'
  active: boolean
  photo?: string
  createdAt: string
  updatedAt: string
  company?: {
    id: string
    name: string
  }
  companyGroup?: {
    id: string
    name: string
  }
}

interface UserListProps {
  onUserUpdate?: () => void
  refreshTrigger?: number
  currentUserId?: string
  onEditUser?: (user: User) => void
}

const userTypeLabels = {
  ADMIN: 'Administrador',
  COMPANY_GROUP: 'Gerente de Grupo',
  COMPANY: 'Gerente de Empresa',
  EMPLOYEE: 'Funcionário'
}

const userTypeColors = {
  ADMIN: 'bg-red-100 text-red-800',
  COMPANY_GROUP: 'bg-purple-100 text-purple-800',
  COMPANY: 'bg-blue-100 text-blue-800',
  EMPLOYEE: 'bg-green-100 text-green-800'
}

const userTypeIcons = {
  ADMIN: Shield,
  COMPANY_GROUP: Building2,
  COMPANY: Building,
  EMPLOYEE: UserCheck
}

export default function UserList({ onUserUpdate, refreshTrigger, currentUserId, onEditUser }: UserListProps) {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<string>('')
  const [filterActive, setFilterActive] = useState<string>('all')

  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const params = new URLSearchParams()
      if (filterType) params.append('userType', filterType)
      if (filterActive !== 'all') params.append('active', filterActive)
      
      const response = await fetch(`/api/users?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error('Erro ao carregar usuários')
      }
      
      const data = await response.json()
      setUsers(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [filterType, filterActive, refreshTrigger])

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Tem certeza que deseja excluir este usuário?')) return

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Erro ao excluir usuário')
      }

      // Apenas chamar onUserUpdate para trigger o refresh da página principal
      onUserUpdate?.()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao excluir usuário')
    }
  }

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !currentStatus })
      })

      if (!response.ok) {
        throw new Error('Erro ao atualizar status do usuário')
      }

      // Apenas chamar onUserUpdate para trigger o refresh da página principal
      onUserUpdate?.()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao atualizar usuário')
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const isNotCurrentUser = user.id !== currentUserId
    return matchesSearch && isNotCurrentUser
  })

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Carregando usuários...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Erro ao carregar usuários</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-red-600">
            <p>{error}</p>
            <Button onClick={fetchUsers} className="mt-4" variant="outline">
              Tentar novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Todos os Usuários ({filteredUsers.length})</CardTitle>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar usuários..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filtros
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setFilterType('')}>
                  Todos os tipos
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterType('ADMIN')}>
                  Administradores
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterType('COMPANY_GROUP')}>
                  Gerentes de Grupo
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterType('COMPANY')}>
                  Gerentes de Empresa
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterType('EMPLOYEE')}>
                  Funcionários
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredUsers.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Nenhum usuário encontrado</p>
            <p className="text-sm">Tente ajustar os filtros de busca</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredUsers.map((user) => {
              const Icon = userTypeIcons[user.userType]
              
              return (
                <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarImage src={user.photo} alt={user.name} />
                      <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                    </Avatar>
                    
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium">{user.name}</h3>
                        {!user.active && (
                          <Badge variant="secondary" className="text-xs">
                            Inativo
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{user.email}</p>
                      {user.phone && (
                        <p className="text-sm text-gray-500">{user.phone}</p>
                      )}
                      <div className="flex items-center space-x-2">
                        <Badge className={userTypeColors[user.userType]}>
                          <Icon className="h-3 w-3 mr-1" />
                          {userTypeLabels[user.userType]}
                        </Badge>
                        {user.company && (
                          <Badge variant="outline" className="text-xs">
                            {user.company.name}
                          </Badge>
                        )}
                        {user.companyGroup && (
                          <Badge variant="outline" className="text-xs">
                            Grupo: {user.companyGroup.name}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEditUser?.(user)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => toggleUserStatus(user.id, user.active)}
                        >
                          <UserCheck className="h-4 w-4 mr-2" />
                          {user.active ? 'Desativar' : 'Ativar'}
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}