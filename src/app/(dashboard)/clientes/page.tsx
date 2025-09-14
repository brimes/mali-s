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
    <div className="space-y-4 lg:space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Clientes</h1>
          <p className="text-sm lg:text-base text-gray-600">Gerencie os clientes do salão</p>
        </div>
        <Link href="/clientes/novo">
          <Button className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Novo Cliente
          </Button>
        </Link>
      </div>

      {/* Clients List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base lg:text-lg">Lista de Clientes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 lg:space-y-4">
            {clientes.map((cliente) => (
              <div
                key={cliente.id}
                className="flex flex-col lg:flex-row lg:items-center justify-between p-3 lg:p-4 border rounded-lg hover:bg-gray-50 gap-3 lg:gap-0"
              >
                <div className="space-y-1 flex-1">
                  <h3 className="font-semibold text-gray-900 text-sm lg:text-base">{cliente.nome}</h3>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs lg:text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Phone className="h-3 w-3 lg:h-4 lg:w-4" />
                      <span className="break-all">{cliente.telefone}</span>
                    </div>
                    {cliente.email && (
                      <div className="flex items-center gap-1">
                        <Mail className="h-3 w-3 lg:h-4 lg:w-4" />
                        <span className="break-all">{cliente.email}</span>
                      </div>
                    )}
                  </div>
                  <div className="text-xs lg:text-sm text-gray-500">
                    {cliente.agendamentos} agendamentos
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
                  <Link href={`/clientes/${cliente.id}`} className="flex-1 lg:flex-none">
                    <Button variant="outline" size="sm" className="w-full lg:w-auto text-xs lg:text-sm">
                      Ver Detalhes
                    </Button>
                  </Link>
                  <Link href={`/clientes/${cliente.id}/editar`} className="flex-1 lg:flex-none">
                    <Button variant="outline" size="sm" className="w-full lg:w-auto text-xs lg:text-sm">
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