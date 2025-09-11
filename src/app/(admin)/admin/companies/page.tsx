import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Building, Plus, Users, Calendar, Scissors } from 'lucide-react'

export default function AdminCompaniesPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gerenciar Empresas</h1>
          <p className="text-gray-600">Controle de todas as empresas do sistema</p>
        </div>
        <Button className="bg-red-600 hover:bg-red-700">
          <Plus className="mr-2 h-4 w-4" />
          Criar Empresa
        </Button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Empresas</p>
                <p className="text-3xl font-bold text-blue-600">3</p>
              </div>
              <Building className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Clientes Totais</p>
                <p className="text-3xl font-bold text-green-600">25</p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Agendamentos</p>
                <p className="text-3xl font-bold text-purple-600">45</p>
              </div>
              <Calendar className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Serviços Totais</p>
                <p className="text-3xl font-bold text-orange-600">12</p>
              </div>
              <Scissors className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Empresas */}
      <Card>
        <CardHeader>
          <CardTitle>Empresas Cadastradas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Empresas de exemplo */}
            <div className="border rounded-lg p-4 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg">Beleza Total - Centro</h3>
                  <p className="text-gray-600">Rua das Flores, 123 - São Paulo, SP</p>
                  <div className="flex items-center mt-2 space-x-4 text-sm text-gray-500">
                    <span>CNPJ: 12.345.678/0001-00</span>
                    <span>•</span>
                    <span>Rede Beleza Total</span>
                    <span>•</span>
                    <span className="text-green-600">Ativo</span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">Ver Detalhes</Button>
                  <Button variant="outline" size="sm">Editar</Button>
                </div>
              </div>
            </div>

            <div className="border rounded-lg p-4 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg">Beleza Total - Shopping</h3>
                  <p className="text-gray-600">Shopping Center, Loja 123 - São Paulo, SP</p>
                  <div className="flex items-center mt-2 space-x-4 text-sm text-gray-500">
                    <span>CNPJ: 12.345.678/0002-00</span>
                    <span>•</span>
                    <span>Rede Beleza Total</span>
                    <span>•</span>
                    <span className="text-green-600">Ativo</span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">Ver Detalhes</Button>
                  <Button variant="outline" size="sm">Editar</Button>
                </div>
              </div>
            </div>

            <div className="text-center py-8 text-gray-500">
              <Building className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Funcionalidades avançadas em desenvolvimento</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}