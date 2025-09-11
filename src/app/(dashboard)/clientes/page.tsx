import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Search, Phone, Mail } from 'lucide-react'
import Link from 'next/link'

// Mock data - Em produção, buscar do banco de dados
const clientes = [
  {
    id: '1',
    nome: 'Maria Silva',
    telefone: '(11) 99999-9999',
    email: 'maria@email.com',
    agendamentos: 5
  },
  {
    id: '2',
    nome: 'João Santos',
    telefone: '(11) 88888-8888',
    email: 'joao@email.com',
    agendamentos: 3
  },
  {
    id: '3',
    nome: 'Ana Paula',
    telefone: '(11) 77777-7777',
    email: 'ana@email.com',
    agendamentos: 8
  }
]

export default function ClientesPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Clientes</h1>
          <p className="text-gray-600">Gerencie os clientes do salão</p>
        </div>
        <Link href="/clientes/novo">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Novo Cliente
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Clientes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {clientes.map((cliente) => (
              <div
                key={cliente.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="space-y-1">
                  <h3 className="font-semibold text-gray-900">{cliente.nome}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Phone className="h-4 w-4" />
                      {cliente.telefone}
                    </div>
                    {cliente.email && (
                      <div className="flex items-center gap-1">
                        <Mail className="h-4 w-4" />
                        {cliente.email}
                      </div>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">
                    {cliente.agendamentos} agendamentos
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link href={`/clientes/${cliente.id}`}>
                    <Button variant="outline" size="sm">
                      Ver Detalhes
                    </Button>
                  </Link>
                  <Link href={`/clientes/${cliente.id}/editar`}>
                    <Button variant="outline" size="sm">
                      Editar
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}