'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { cn } from '@/lib/utils'
import {
  Shield,
  Users,
  Building,
  Building2,
  BarChart3,
  Settings,
  Home,
  LogOut,
  UserPlus,
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

const adminNavigation = [
  { name: 'Dashboard Admin', href: '/admin', icon: Shield },
  { name: 'Usuários', href: '/admin/users', icon: Users },
  { name: 'Grupos de Empresas', href: '/admin/company-groups', icon: Building2 },
  { name: 'Empresas', href: '/admin/companies', icon: Building },
  { name: 'Relatórios Globais', href: '/admin/reports', icon: BarChart3 },
  { name: 'Configurações', href: '/admin/settings', icon: Settings },
]

interface MobileAdminSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function MobileAdminSidebar({ isOpen, onClose }: MobileAdminSidebarProps) {
  const pathname = usePathname()
  const { data: session } = useSession()

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/login' })
  }

  if (!session?.user) {
    return null
  }

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
        "fixed inset-y-0 left-0 z-50 w-64 bg-red-900 text-white transform transition-transform duration-200 ease-in-out lg:hidden",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex h-16 items-center justify-between px-6 border-b border-red-800">
            <div className="flex items-center">
              <Shield className="h-6 w-6 mr-2" />
              <h1 className="text-xl font-bold">Admin Mali-S</h1>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="p-2 text-white hover:bg-red-800"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
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
                      ? 'bg-red-800 text-white border-r-2 border-red-400'
                      : 'text-red-100 hover:bg-red-800 hover:text-white'
                  )}
                >
                  <item.icon
                    className={cn(
                      'mr-3 h-5 w-5',
                      isActive ? 'text-red-200' : 'text-red-300'
                    )}
                  />
                  {item.name}
                </Link>
              )
            })}
          </nav>
          
          {/* User Menu */}
          <div className="border-t border-red-800 p-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full justify-start p-0 h-auto text-white hover:bg-red-800">
                  <div className="flex items-center w-full">
                    <Avatar className="h-8 w-8 border-2 border-red-400">
                      <AvatarImage src={session.user.image || ''} alt={session.user.name || ''} />
                      <AvatarFallback className="bg-red-700 text-red-100">
                        {session.user.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'A'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="ml-3 flex-1 text-left">
                      <p className="text-sm font-medium text-white truncate">
                        {session.user.name}
                      </p>
                      <div className="flex items-center text-xs text-red-200">
                        <Shield className="h-3 w-3 mr-1" />
                        Administrador
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
                    <p className="text-xs text-red-600 font-medium">Administrador do Sistema</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                <DropdownMenuItem asChild>
                  <Link href="/dashboard">
                    <Home className="mr-2 h-4 w-4" />
                    Dashboard Principal
                  </Link>
                </DropdownMenuItem>
                
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Configurações Admin
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
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