'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react'
import { CalendarioNavigationProps } from '@/types/agendamentos'

interface CalendarioMesProps extends CalendarioNavigationProps {}

export function CalendarioMes({ agendamentos, dataSelecionada, onDataChange, onDiaClick }: CalendarioMesProps) {
  const mesAtual = dataSelecionada.getMonth()
  const anoAtual = dataSelecionada.getFullYear()

  const nomeMes = new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(dataSelecionada)
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

  const navegarMes = (direcao: 'anterior' | 'proximo') => {
    const novaData = new Date(dataSelecionada)
    if (direcao === 'anterior') {
      novaData.setMonth(novaData.getMonth() - 1)
    } else {
      novaData.setMonth(novaData.getMonth() + 1)
    }
    onDataChange(novaData)
  }

  // Contar agendamentos por dia
  const contarAgendamentosPorDia = (dia: number) => {
    return agendamentos.filter(agendamento => {
      const dataAgendamento = new Date(agendamento.dataHora)
      return (
        dataAgendamento.getDate() === dia &&
        dataAgendamento.getMonth() === mesAtual &&
        dataAgendamento.getFullYear() === anoAtual
      )
    }).length
  }

  const obterAgendamentosDia = (dia: number) => {
    return agendamentos.filter(agendamento => {
      const dataAgendamento = new Date(agendamento.dataHora)
      return (
        dataAgendamento.getDate() === dia &&
        dataAgendamento.getMonth() === mesAtual &&
        dataAgendamento.getFullYear() === anoAtual
      )
    })
  }

  const hoje = new Date()
  const isToday = (dia: number) => {
    return (
      dia === hoje.getDate() &&
      mesAtual === hoje.getMonth() &&
      anoAtual === hoje.getFullYear()
    )
  }

  const handleDiaClick = (dia: number) => {
    const dataDia = new Date(anoAtual, mesAtual, dia)
    onDiaClick(dataDia)
  }

  const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            <span className="capitalize">{nomeMes} {nomeAno}</span>
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => navegarMes('anterior')}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => navegarMes('proximo')}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
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
          {dias.map((dia, index) => {
            const agendamentosCount = dia ? contarAgendamentosPorDia(dia) : 0
            const agendamentosdia = dia ? obterAgendamentosDia(dia) : []
            
            return (
              <div
                key={index}
                className={`
                  min-h-[100px] p-2 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors
                  ${dia && isToday(dia) ? 'bg-blue-50 border-blue-200' : 'border-gray-200'}
                  ${!dia ? 'cursor-default hover:bg-transparent border-transparent' : ''}
                `}
                onClick={() => dia && handleDiaClick(dia)}
              >
                {dia && (
                  <>
                    <div className={`text-sm font-medium mb-1 ${isToday(dia) ? 'text-blue-800' : ''}`}>
                      {dia}
                    </div>
                    
                    {agendamentosCount > 0 && (
                      <div className="space-y-1">
                        {/* Mostrar até 3 agendamentos */}
                        {agendamentosdia.slice(0, 3).map((agendamento) => (
                          <div
                            key={agendamento.id}
                            className="text-xs bg-blue-100 text-blue-800 px-1 py-0.5 rounded truncate"
                            title={`${agendamento.cliente.nome} - ${agendamento.servico.nome}`}
                          >
                            {new Date(agendamento.dataHora).toLocaleTimeString('pt-BR', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })} {agendamento.cliente.nome}
                          </div>
                        ))}
                        
                        {/* Indicador de mais agendamentos */}
                        {agendamentosCount > 3 && (
                          <div className="text-xs text-blue-600 font-medium">
                            +{agendamentosCount - 3} mais
                          </div>
                        )}
                        
                        {/* Contador total no final */}
                        {agendamentosCount <= 3 && (
                          <div className="text-xs text-gray-500 font-medium">
                            {agendamentosCount} agend.
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            )
          })}
        </div>

        {/* Legenda */}
        <div className="mt-4 pt-4 border-t border-gray-200">
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
        </div>
      </CardContent>
    </Card>
  )
}