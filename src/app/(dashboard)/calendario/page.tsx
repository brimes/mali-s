import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, ChevronLeft, ChevronRight, Plus } from 'lucide-react'

export default function CalendarioPage() {
  // Mock data para demonstração
  const hoje = new Date()
  const mesAtual = hoje.getMonth()
  const anoAtual = hoje.getFullYear()

  const nomeMes = new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(hoje)
  const nomeAno = anoAtual.toString()

  // Gerar dias do mês
  const diasNoMes = new Date(anoAtual, mesAtual + 1, 0).getDate()
  const primeiroDiaMes = new Date(anoAtual, mesAtual, 1).getDay()
  
  const dias = []
  
  // Dias vazios no início
  for (let i = 0; i < primeiroDiaMes; i++) {
    dias.push(null)
  }
  
  // Dias do mês
  for (let dia = 1; dia <= diasNoMes; dia++) {
    dias.push(dia)
  }

  // Mock de agendamentos por dia
  const agendamentosPorDia: Record<number, number> = {
    15: 3,
    16: 5,
    17: 2,
    18: 4,
    19: 1,
    22: 3,
    23: 6,
  }

  const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Calendário</h1>
          <p className="text-gray-600">Visualização mensal dos agendamentos</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Novo Agendamento
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              <span className="capitalize">{nomeMes} {nomeAno}</span>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Cabeçalho dos dias da semana */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {diasSemana.map((dia) => (
              <div
                key={dia}
                className="p-2 text-center text-sm font-medium text-gray-500"
              >
                {dia}
              </div>
            ))}
          </div>

          {/* Grid do calendário */}
          <div className="grid grid-cols-7 gap-1">
            {dias.map((dia, index) => (
              <div
                key={index}
                className={`
                  min-h-[80px] p-2 border rounded-lg cursor-pointer hover:bg-gray-50
                  ${dia === hoje.getDate() ? 'bg-blue-50 border-blue-200' : ''}
                  ${!dia ? 'cursor-default hover:bg-transparent' : ''}
                `}
              >
                {dia && (
                  <>
                    <div className="text-sm font-medium mb-1">{dia}</div>
                    {agendamentosPorDia[dia] && (
                      <div className="text-xs">
                        <div className="bg-blue-100 text-blue-800 px-1 rounded">
                          {agendamentosPorDia[dia]} agend.
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Legenda */}
      <Card>
        <CardHeader>
          <CardTitle>Legenda</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-50 border border-blue-200 rounded"></div>
              <span>Hoje</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-100 rounded"></div>
              <span>Dias com agendamentos</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}