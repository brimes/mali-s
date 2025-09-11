import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Clock, Users } from 'lucide-react'
import Link from 'next/link'

// Mock data - Em produção, buscar do banco de dados
const funcionarios = [
  {
    id: '1',
    nome: 'Ana Costa',
    telefone: '(11) 11111-1111',
    especialidades: ['corte', 'pintura', 'tratamento'],
    horarioInicio: '08:00',
    horarioFim: '18:00',
    diasTrabalho: ['segunda', 'terca', 'quarta', 'quinta', 'sexta'],
    ativo: true
  },
  {
    id: '2',
    nome: 'Carla Lima',
    telefone: '(11) 22222-2222',
    especialidades: ['manicure', 'pedicure', 'sobrancelha'],
    horarioInicio: '09:00',
    horarioFim: '17:00',
    diasTrabalho: ['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'],
    ativo: true
  }
]

export default function FuncionariosPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Funcionários</h1>
          <p className="text-gray-600">Gerencie os funcionários do salão</p>
        </div>
        <Link href="/funcionarios/novo">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Novo Funcionário
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Funcionários</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {funcionarios.map((funcionario) => (
              <div
                key={funcionario.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">{funcionario.nome}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      funcionario.ativo 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {funcionario.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {funcionario.horarioInicio} - {funcionario.horarioFim}
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {funcionario.diasTrabalho.length} dias/semana
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-1">
                    {funcionario.especialidades.map((esp, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
                      >
                        {esp}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Link href={`/funcionarios/${funcionario.id}`}>
                    <Button variant="outline" size="sm">
                      Ver Detalhes
                    </Button>
                  </Link>
                  <Link href={`/funcionarios/${funcionario.id}/editar`}>
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