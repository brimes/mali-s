import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Settings, Shield, Bell, Mail, Palette } from 'lucide-react'

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Configurações do Sistema</h1>
        <p className="text-gray-600">Configurações globais e preferências administrativas</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Configurações Gerais */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="mr-2 h-5 w-5" />
              Configurações Gerais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 border rounded">
              <div>
                <h4 className="font-medium">Modo de Manutenção</h4>
                <p className="text-sm text-gray-600">Bloquear acesso ao sistema</p>
              </div>
              <Button variant="outline" size="sm">Configurar</Button>
            </div>
            
            <div className="flex items-center justify-between p-3 border rounded">
              <div>
                <h4 className="font-medium">Fuso Horário</h4>
                <p className="text-sm text-gray-600">América/São_Paulo</p>
              </div>
              <Button variant="outline" size="sm">Alterar</Button>
            </div>
            
            <div className="flex items-center justify-between p-3 border rounded">
              <div>
                <h4 className="font-medium">Idioma do Sistema</h4>
                <p className="text-sm text-gray-600">Português (Brasil)</p>
              </div>
              <Button variant="outline" size="sm">Alterar</Button>
            </div>
          </CardContent>
        </Card>

        {/* Segurança */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="mr-2 h-5 w-5" />
              Segurança
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 border rounded">
              <div>
                <h4 className="font-medium">Autenticação de Dois Fatores</h4>
                <p className="text-sm text-gray-600">Adicionar camada extra de segurança</p>
              </div>
              <Button variant="outline" size="sm">Ativar</Button>
            </div>
            
            <div className="flex items-center justify-between p-3 border rounded">
              <div>
                <h4 className="font-medium">Logs de Auditoria</h4>
                <p className="text-sm text-gray-600">Registrar ações dos usuários</p>
              </div>
              <Button variant="outline" size="sm">Ver Logs</Button>
            </div>
            
            <div className="flex items-center justify-between p-3 border rounded">
              <div>
                <h4 className="font-medium">Sessões Ativas</h4>
                <p className="text-sm text-gray-600">Gerenciar sessões de usuários</p>
              </div>
              <Button variant="outline" size="sm">Gerenciar</Button>
            </div>
          </CardContent>
        </Card>

        {/* Notificações */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="mr-2 h-5 w-5" />
              Notificações
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 border rounded">
              <div>
                <h4 className="font-medium">Notificações por Email</h4>
                <p className="text-sm text-gray-600">Alertas administrativos</p>
              </div>
              <Button variant="outline" size="sm">Configurar</Button>
            </div>
            
            <div className="flex items-center justify-between p-3 border rounded">
              <div>
                <h4 className="font-medium">Alertas de Sistema</h4>
                <p className="text-sm text-gray-600">Erros e problemas críticos</p>
              </div>
              <Button variant="outline" size="sm">Configurar</Button>
            </div>
            
            <div className="flex items-center justify-between p-3 border rounded">
              <div>
                <h4 className="font-medium">Relatórios Automáticos</h4>
                <p className="text-sm text-gray-600">Envio periódico de relatórios</p>
              </div>
              <Button variant="outline" size="sm">Configurar</Button>
            </div>
          </CardContent>
        </Card>

        {/* Aparência */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Palette className="mr-2 h-5 w-5" />
              Aparência
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 border rounded">
              <div>
                <h4 className="font-medium">Tema do Sistema</h4>
                <p className="text-sm text-gray-600">Claro / Escuro / Auto</p>
              </div>
              <Button variant="outline" size="sm">Alterar</Button>
            </div>
            
            <div className="flex items-center justify-between p-3 border rounded">
              <div>
                <h4 className="font-medium">Logo da Empresa</h4>
                <p className="text-sm text-gray-600">Personalizar branding</p>
              </div>
              <Button variant="outline" size="sm">Upload</Button>
            </div>
            
            <div className="flex items-center justify-between p-3 border rounded">
              <div>
                <h4 className="font-medium">Cores Personalizadas</h4>
                <p className="text-sm text-gray-600">Esquema de cores</p>
              </div>
              <Button variant="outline" size="sm">Personalizar</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ações Críticas */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center text-red-700">
            <Settings className="mr-2 h-5 w-5" />
            Ações Críticas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button variant="outline" className="border-orange-200 text-orange-700 hover:bg-orange-50">
              <Settings className="mr-2 h-4 w-4" />
              Reset Configurações
            </Button>
            
            <Button variant="outline" className="border-gray-200 text-gray-700 hover:bg-gray-50">
              <Mail className="mr-2 h-4 w-4" />
              Teste de Email
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-12 text-center">
          <Settings className="h-16 w-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Configurações Avançadas</h3>
          <p className="text-gray-500">
            Configurações detalhadas serão implementadas nas próximas versões.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}