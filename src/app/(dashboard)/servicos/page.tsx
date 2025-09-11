import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Clock, DollarSign } from 'lucide-react'
import Link from 'next/link'

// Mock data - Em produção, buscar do banco de dados
const servicos = [
  {
    id: '1',
    nome: 'Corte Feminino',
    descricao: 'Corte de cabelo feminino',
    duracao: 60,
    preco: 45.00,
    categoria: 'cabelo',
    ativo: true
  },
  {
    id: '2',
    nome: 'Manicure',
    descricao: 'Cuidados com as unhas das mãos',
    duracao: 45,
    preco: 20.00,
    categoria: 'unha',
    ativo: true
  },
  {
    id: '3',
    nome: 'Pintura Completa',
    descricao: 'Coloração completa do cabelo',
    duracao: 120,
    preco: 80.00,
    categoria: 'cabelo',
    ativo: true
  }
]

export default function ServicosPage() {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price)
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours === 0) return `${mins}min`
    if (mins === 0) return `${hours}h`
    return `${hours}h${mins}min`
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Serviços</h1>
          <p className="text-gray-600">Gerencie os serviços oferecidos</p>
        </div>
        <Link href="/servicos/novo">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Novo Serviço
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Serviços</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {servicos.map((servico) => (
              <div
                key={servico.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">{servico.nome}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      servico.ativo 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {servico.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                    <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">
                      {servico.categoria}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600">{servico.descricao}</p>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {formatDuration(servico.duracao)}
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      {formatPrice(servico.preco)}
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Link href={`/servicos/${servico.id}`}>
                    <Button variant="outline" size="sm">
                      Ver Detalhes
                    </Button>
                  </Link>
                  <Link href={`/servicos/${servico.id}/editar`}>
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