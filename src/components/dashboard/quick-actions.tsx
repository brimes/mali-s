'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Calendar, Users, UserPlus, Scissors } from 'lucide-react'

export function QuickActions() {
  const actions = [
    {
      title: 'Novo Agendamento',
      description: 'Criar um novo agendamento',
      icon: Calendar,
      color: 'bg-blue-500 hover:bg-blue-600',
      href: '/agendamentos/novo'
    },
    {
      title: 'Novo Cliente',
      description: 'Cadastrar novo cliente',
      icon: Users,
      color: 'bg-green-500 hover:bg-green-600',
      href: '/clientes/novo'
    },
    {
      title: 'Novo Funcionário',
      description: 'Cadastrar funcionário',
      icon: UserPlus,
      color: 'bg-purple-500 hover:bg-purple-600',
      href: '/funcionarios/novo'
    },
    {
      title: 'Novo Serviço',
      description: 'Cadastrar novo serviço',
      icon: Scissors,
      color: 'bg-orange-500 hover:bg-orange-600',
      href: '/servicos/novo'
    }
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Ações Rápidas
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4">
        {actions.map((action, index) => (
          <Button
            key={index}
            variant="outline"
            className="h-auto p-4 flex flex-col items-center gap-2 hover:shadow-md transition-shadow"
          >
            <action.icon className="h-6 w-6 text-gray-600" />
            <div className="text-center">
              <div className="font-medium text-sm">{action.title}</div>
              <div className="text-xs text-gray-500">{action.description}</div>
            </div>
          </Button>
        ))}
      </CardContent>
    </Card>
  )
}