'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Clock, User, Scissors } from 'lucide-react'

// Mock data - Em produção, buscar do banco de dados
const recentAppointments = [
  {
    id: '1',
    cliente: 'Maria Silva',
    funcionario: 'Ana Costa',
    servico: 'Corte e Escova',
    horario: '14:00',
    status: 'agendado'
  },
  {
    id: '2',
    cliente: 'João Santos',
    funcionario: 'Carla Lima',
    servico: 'Barba',
    horario: '15:30',
    status: 'agendado'
  },
  {
    id: '3',
    cliente: 'Ana Paula',
    funcionario: 'Fernanda',
    servico: 'Manicure',
    horario: '16:00',
    status: 'concluido'
  }
]

export function RecentAppointments() {
  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base lg:text-lg">
          <Clock className="h-4 w-4 lg:h-5 lg:w-5" />
          Próximos Agendamentos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 lg:space-y-4">
        {recentAppointments.map((appointment) => (
          <div
            key={appointment.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border rounded-lg gap-3 sm:gap-0"
          >
            <div className="space-y-1 flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <User className="h-3 w-3 lg:h-4 lg:w-4 text-gray-500 flex-shrink-0" />
                <span className="font-medium text-sm lg:text-base truncate">{appointment.cliente}</span>
              </div>
              <div className="flex items-center gap-2 text-xs lg:text-sm text-gray-600">
                <Scissors className="h-3 w-3 lg:h-4 lg:w-4 flex-shrink-0" />
                <span className="truncate">{appointment.servico}</span>
              </div>
              <div className="text-xs lg:text-sm text-gray-500 truncate">
                com {appointment.funcionario}
              </div>
            </div>
            <div className="text-left sm:text-right flex-shrink-0">
              <div className="font-medium text-sm lg:text-base">{appointment.horario}</div>
              <div className={`text-xs lg:text-sm px-2 py-1 rounded-full inline-block mt-1 ${
                appointment.status === 'agendado' 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-green-100 text-green-800'
              }`}>
                {appointment.status === 'agendado' ? 'Agendado' : 'Concluído'}
              </div>
            </div>
          </div>
        ))}
        <Button className="w-full mt-3 lg:mt-4 text-sm lg:text-base">
          Ver Todos os Agendamentos
        </Button>
      </CardContent>
    </Card>
  )
}