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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Próximos Agendamentos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {recentAppointments.map((appointment) => (
          <div
            key={appointment.id}
            className="flex items-center justify-between p-3 border rounded-lg"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-500" />
                <span className="font-medium">{appointment.cliente}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Scissors className="h-4 w-4" />
                <span>{appointment.servico}</span>
              </div>
              <div className="text-sm text-gray-500">
                com {appointment.funcionario}
              </div>
            </div>
            <div className="text-right">
              <div className="font-medium">{appointment.horario}</div>
              <div className={`text-sm px-2 py-1 rounded-full ${
                appointment.status === 'agendado' 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-green-100 text-green-800'
              }`}>
                {appointment.status === 'agendado' ? 'Agendado' : 'Concluído'}
              </div>
            </div>
          </div>
        ))}
        <Button className="w-full mt-4">Ver Todos os Agendamentos</Button>
      </CardContent>
    </Card>
  )
}