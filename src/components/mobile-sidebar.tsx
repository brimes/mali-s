'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { cn } from '@/lib/utils'
import {
  Calendar,
  Users,
  UserPlus,
  Scissors,
  BarChart3,
  Settings,
  Home,
  LogOut,
  User,
  Shield,
  Building,
  Building2,
  Menu,
  X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Agendamentos', href: '/agendamentos', icon: Calendar },
  { name: 'Clientes', href: '/clientes', icon: Users },
  { name: 'Funcionários', href: '/funcionarios', icon: UserPlus },
  { name: 'Serviços', href: '/servicos', icon: Scissors },
  { name: 'Calendário', href: '/calendario', icon: BarChart3 },
]

// Navegação adicional para admins
const adminNavigation = [
  { name: 'Área Administrativa', href: '/admin', icon: Shield }
]

const getUserTypeIcon = (userType: string) => {
  switch (userType) {
    case 'ADMIN':
      return Shield
    case 'COMPANY_GROUP':
      return Building2
    case 'COMPANY':
      return Building
    case 'EMPLOYEE':
      return User
    default:
      return User
  }
}

const getUserTypeLabel = (userType: string) => {
  switch (userType) {
    case 'ADMIN':
      return 'Administrador'
    case 'COMPANY_GROUP':
      return 'Gerente de Rede'
    case 'COMPANY':
      return 'Gerente da Loja'
    case 'EMPLOYEE':
      return 'Funcionário'
    default:
      return 'Usuário'
  }
}

interface MobileSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function MobileSidebar({ isOpen, onClose }: MobileSidebarProps) {
  const pathname = usePathname()
  const { data: session } = useSession()

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/login' })
  }

  if (!session?.user) {
    return null
  }

  const UserTypeIcon = getUserTypeIcon(session.user.userType)
  const userTypeLabel = getUserTypeLabel(session.user.userType)

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out lg:hidden",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex h-16 items-center justify-between px-6 border-b border-gray-200">
            <h1 className="text-xl font-bold text-gray-900">Mali-S</h1>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="p-2"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    'flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                    isActive
                      ? 'bg-purple-50 text-purple-700 border-r-2 border-purple-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  )}
                >
                  <item.icon
                    className={cn(
                      'mr-3 h-5 w-5',
                      isActive ? 'text-purple-700' : 'text-gray-400'
                    )}
                  />
                  {item.name}
                </Link>
              )
            })}
            
            {/* Seção administrativa (apenas para admins) */}
            {session.user.userType === 'ADMIN' && (
              <>
                <div className="border-t border-gray-200 my-3"></div>
                <div className="px-3 mb-2">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Administração
                  </span>
                </div>
                {adminNavigation.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={onClose}
                      className={cn(
                        'flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                        isActive
                          ? 'bg-red-50 text-red-700 border-r-2 border-red-700'
                          : 'text-gray-600 hover:bg-red-50 hover:text-red-700'
                      )}
                    >
                      <item.icon
                        className={cn(
                          'mr-3 h-5 w-5',
                          isActive ? 'text-red-700' : 'text-gray-400'
                        )}
                      />
                      {item.name}
                    </Link>
                  )
                })}
              </>
            )}
          </nav>
          
          {/* User Menu */}
          <div className="border-t border-gray-200 p-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full justify-start p-0 h-auto">
                  <div className="flex items-center w-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={session.user.image || ''} alt={session.user.name || ''} />
                      <AvatarFallback>
                        {session.user.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="ml-3 flex-1 text-left">
                      <p className="text-sm font-medium text-gray-700 truncate">
                        {session.user.name}
                      </p>
                      <div className="flex items-center text-xs text-gray-500">
                        <UserTypeIcon className="h-3 w-3 mr-1" />
                        {userTypeLabel}
                      </div>
                    </div>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div>
                    <p className="font-medium">{session.user.name}</p>
                    <p className="text-xs text-gray-500">{session.user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                {session.user.company && (
                  <DropdownMenuItem>
                    <Building className="mr-2 h-4 w-4" />
                    {session.user.company.name}
                  </DropdownMenuItem>
                )}
                
                {session.user.companyGroup && (
                  <DropdownMenuItem>
                    <Building2 className="mr-2 h-4 w-4" />
                    {session.user.companyGroup.name}
                  </DropdownMenuItem>
                )}
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Configurações
                </DropdownMenuItem>
                
                <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </>
  )
}