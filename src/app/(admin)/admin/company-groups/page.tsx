import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Building2, Plus, BarChart3 } from 'lucide-react'

export default function AdminCompanyGroupsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Grupos de Empresas</h1>
          <p className="text-gray-600">Gerenciar redes e franquias</p>
        </div>
        <Button className="bg-red-600 hover:bg-red-700">
          <Plus className="mr-2 h-4 w-4" />
          Criar Grupo
        </Button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Grupos</p>
                <p className="text-3xl font-bold text-purple-600">1</p>
              </div>
              <Building2 className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Empresas Totais</p>
                <p className="text-3xl font-bold text-blue-600">3</p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Grupos Ativos</p>
                <p className="text-3xl font-bold text-green-600">1</p>
              </div>
              <Building2 className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Grupos */}
      <Card>
        <CardHeader>
          <CardTitle>Grupos Existentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Grupo de exemplo */}
            <div className="border rounded-lg p-4 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg">Rede Beleza Total</h3>
                  <p className="text-gray-600">Rede de salões de beleza com várias unidades</p>
                  <div className="flex items-center mt-2 space-x-4 text-sm text-gray-500">
                    <span>3 empresas</span>
                    <span>•</span>
                    <span>Ativo</span>
                    <span>•</span>
                    <span>Criado em Nov 2024</span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">Editar</Button>
                  <Button variant="outline" size="sm">Ver Empresas</Button>
                </div>
              </div>
            </div>

            <div className="text-center py-8 text-gray-500">
              <Building2 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Mais funcionalidades em desenvolvimento</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}