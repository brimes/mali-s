import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Calendar, Clock, User, Phone } from 'lucide-react'
import Link from 'next/link'

// Mock data - Em produção, buscar do banco de dados
const agendamentos = [
  {
    id: '1',
    dataHora: new Date(2024, 10, 15, 14, 0),
    cliente: {
      id: '1',
      nome: 'Maria Silva',
      telefone: '(11) 99999-9999'
    },
    funcionario: {
      id: '1',
      nome: 'Ana Costa'
    },
    servico: {
      id: '1',
      nome: 'Corte Feminino',
      duracao: 60,
      preco: 45.00
    },
    status: 'agendado',
    observacoes: ''
  },
  {
    id: '2',
    dataHora: new Date(2024, 10, 15, 15, 30),
    cliente: {
      id: '2',
      nome: 'João Santos',
      telefone: '(11) 88888-8888'
    },
    funcionario: {
      id: '2',
      nome: 'Carla Lima'
    },
    servico: {
      id: '5',
      nome: 'Manicure',
      duracao: 45,
      preco: 20.00
    },
    status: 'agendado',
    observacoes: ''
  },
  {
    id: '3',
    dataHora: new Date(2024, 10, 14, 16, 0),
    cliente: {
      id: '3',
      nome: 'Ana Paula',
      telefone: '(11) 77777-7777'
    },
    funcionario: {
      id: '3',
      nome: 'Fernanda Rocha'
    },
    servico: {
      id: '7',
      nome: 'Design de Sobrancelha',
      duracao: 30,
      preco: 15.00
    },
    status: 'concluido',
    observacoes: ''
  }
]

export default function AgendamentosPage() {
  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'agendado':
        return 'bg-blue-100 text-blue-800'
      case 'concluido':
        return 'bg-green-100 text-green-800'
      case 'cancelado':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'agendado':
        return 'Agendado'
      case 'concluido':
        return 'Concluído'
      case 'cancelado':
        return 'Cancelado'
      default:
        return status
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Agendamentos</h1>
          <p className="text-gray-600">Gerencie todos os agendamentos</p>
        </div>
        <Link href="/agendamentos/novo">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Novo Agendamento
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Agendamentos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {agendamentos.map((agendamento) => (
              <div
                key={agendamento.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">
                      {formatDateTime(agendamento.dataHora)}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(agendamento.status)}`}>
                      {getStatusText(agendamento.status)}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      {agendamento.cliente.nome}
                    </div>
                    <div className="flex items-center gap-1">
                      <Phone className="h-4 w-4" />
                      {agendamento.cliente.telefone}
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-600">
                    <strong>{agendamento.servico.nome}</strong> com {agendamento.funcionario.nome}
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {agendamento.servico.duracao}min
                    </div>
                    <div>
                      {formatPrice(agendamento.servico.preco)}
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Link href={`/agendamentos/${agendamento.id}`}>
                    <Button variant="outline" size="sm">
                      Ver Detalhes
                    </Button>
                  </Link>
                  {agendamento.status === 'agendado' && (
                    <Link href={`/agendamentos/${agendamento.id}/editar`}>
                      <Button variant="outline" size="sm">
                        Editar
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}