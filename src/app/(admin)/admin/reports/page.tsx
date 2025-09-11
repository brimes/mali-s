import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart3, TrendingUp, Users, Calendar } from 'lucide-react'

export default function AdminReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Relatórios Globais</h1>
        <p className="text-gray-600">Análises e métricas de todo o sistema</p>
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Receita Total</p>
                <p className="text-3xl font-bold text-green-600">R$ 45.780</p>
                <p className="text-sm text-green-500">+12% este mês</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Agendamentos</p>
                <p className="text-3xl font-bold text-blue-600">1,234</p>
                <p className="text-sm text-blue-500">+8% este mês</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Clientes Ativos</p>
                <p className="text-3xl font-bold text-purple-600">567</p>
                <p className="text-sm text-purple-500">+15% este mês</p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Taxa de Ocupação</p>
                <p className="text-3xl font-bold text-orange-600">78%</p>
                <p className="text-sm text-orange-500">+3% este mês</p>
              </div>
              <BarChart3 className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Relatórios Disponíveis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Relatórios Financeiros</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 border rounded hover:bg-gray-50 cursor-pointer">
              <h4 className="font-medium">Receita por Empresa</h4>
              <p className="text-sm text-gray-600">Comparativo mensal de faturamento</p>
            </div>
            <div className="p-3 border rounded hover:bg-gray-50 cursor-pointer">
              <h4 className="font-medium">Comissões por Funcionário</h4>
              <p className="text-sm text-gray-600">Relatório de produtividade</p>
            </div>
            <div className="p-3 border rounded hover:bg-gray-50 cursor-pointer">
              <h4 className="font-medium">Análise de Lucro</h4>
              <p className="text-sm text-gray-600">Margem por serviço e empresa</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Relatórios Operacionais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 border rounded hover:bg-gray-50 cursor-pointer">
              <h4 className="font-medium">Ocupação por Horário</h4>
              <p className="text-sm text-gray-600">Análise de horários de pico</p>
            </div>
            <div className="p-3 border rounded hover:bg-gray-50 cursor-pointer">
              <h4 className="font-medium">Serviços Mais Populares</h4>
              <p className="text-sm text-gray-600">Ranking de preferências</p>
            </div>
            <div className="p-3 border rounded hover:bg-gray-50 cursor-pointer">
              <h4 className="font-medium">Retenção de Clientes</h4>
              <p className="text-sm text-gray-600">Taxa de retorno e fidelidade</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-12 text-center">
          <BarChart3 className="h-16 w-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Relatórios em Desenvolvimento</h3>
          <p className="text-gray-500">
            Os relatórios detalhados serão implementados nas próximas versões do sistema.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}