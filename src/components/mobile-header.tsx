'use client'

import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { Menu, Bell, Search, LogOut, Settings, User } from 'lucide-react'
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
import { Badge } from '@/components/ui/badge'

interface MobileHeaderProps {
  title?: string
  onMenuClick: () => void
  variant?: 'default' | 'admin'
}

export function MobileHeader({ title, onMenuClick, variant = 'default' }: MobileHeaderProps) {
  const { data: session } = useSession()

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/login' })
  }

  const getUserTypeLabel = (userType: string) => {
    switch (userType) {
      case 'ADMIN':
        return 'Admin'
      case 'COMPANY_GROUP':
        return 'Gerente de Rede'
      case 'COMPANY':
        return 'Gerente'
      case 'EMPLOYEE':
        return 'Funcionário'
      default:
        return 'Usuário'
    }
  }

  const headerBg = variant === 'admin' ? 'bg-red-900 text-white' : 'bg-white border-b border-gray-200'
  const buttonVariant = variant === 'admin' ? 'ghost' : 'ghost'
  const buttonClass = variant === 'admin' ? 'text-white hover:bg-red-800' : 'text-gray-600 hover:bg-gray-100'

  return (
    <header className={`lg:hidden flex items-center justify-between h-16 px-4 ${headerBg}`}>
      {/* Left side - Menu and Title */}
      <div className="flex items-center gap-3">
        <Button
          variant={buttonVariant}
          size="sm"
          onClick={onMenuClick}
          className={`p-2 ${buttonClass}`}
        >
          <Menu className="h-5 w-5" />
        </Button>
        
        {title && (
          <h1 className={`text-lg font-semibold truncate ${variant === 'admin' ? 'text-white' : 'text-gray-900'}`}>
            {title}
          </h1>
        )}
      </div>

      {/* Right side - Notifications and Profile */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <Button
          variant={buttonVariant}
          size="sm"
          className={`p-2 ${buttonClass} relative`}
        >
          <Bell className="h-5 w-5" />
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
          >
            3
          </Badge>
        </Button>

        {/* Profile Dropdown */}
        {session?.user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant={buttonVariant} className={`p-1 rounded-full ${buttonClass}`}>
                <Avatar className="h-8 w-8">
                  <AvatarImage src={session.user.image || ''} alt={session.user.name || ''} />
                  <AvatarFallback className={variant === 'admin' ? 'bg-red-700 text-red-100' : ''}>
                    {session.user.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div>
                  <p className="font-medium">{session.user.name}</p>
                  <p className="text-xs text-gray-500">{session.user.email}</p>
                  <Badge variant="outline" className="mt-1 text-xs">
                    {getUserTypeLabel(session.user.userType)}
                  </Badge>
                </div>
              </DropdownMenuLabel>
              
              {(session.user.company || session.user.companyGroup) && (
                <>
                  <DropdownMenuSeparator />
                  {session.user.company && (
                    <DropdownMenuItem disabled>
                      <div className="text-xs">
                        <p className="font-medium text-gray-700">Empresa</p>
                        <p className="text-gray-500">{session.user.company.name}</p>
                      </div>
                    </DropdownMenuItem>
                  )}
                  {session.user.companyGroup && (
                    <DropdownMenuItem disabled>
                      <div className="text-xs">
                        <p className="font-medium text-gray-700">Grupo</p>
                        <p className="text-gray-500">{session.user.companyGroup.name}</p>
                      </div>
                    </DropdownMenuItem>
                  )}
                </>
              )}
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                Meu Perfil
              </DropdownMenuItem>
              
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Configurações
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  )
}