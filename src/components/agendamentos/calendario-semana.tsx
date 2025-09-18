'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { CalendarioNavigationProps } from '@/types/agendamentos'

interface CalendarioSemanaProps extends CalendarioNavigationProps {}

export function CalendarioSemana({ agendamentos, dataSelecionada, onDataChange, onDiaClick }: CalendarioSemanaProps) {
  // Gerar horários das 7h às 20h (a cada hora)
  const gerarHorarios = () => {
    const horarios = []
    for (let hora = 7; hora <= 20; hora++) {
      horarios.push(`${hora.toString().padStart(2, '0')}:00`)
    }
    return horarios
  }

  const horarios = gerarHorarios()

  // Obter início da semana (domingo)
  const obterInicioSemana = (data: Date) => {
    const inicio = new Date(data)
    inicio.setDate(inicio.getDate() - inicio.getDay())
    return inicio
  }

  // Gerar dias da semana
  const gerarDiasSemana = () => {
    const inicioSemana = obterInicioSemana(dataSelecionada)
    const dias = []
    
    for (let i = 0; i < 7; i++) {
      const dia = new Date(inicioSemana)
      dia.setDate(inicioSemana.getDate() + i)
      dias.push(dia)
    }
    
    return dias
  }

  const diasSemana = gerarDiasSemana()
  const nomesDias = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

  const formatSemana = () => {
    const inicio = diasSemana[0]
    const fim = diasSemana[6]
    
    return `${inicio.getDate()}/${(inicio.getMonth() + 1).toString().padStart(2, '0')} - ${fim.getDate()}/${(fim.getMonth() + 1).toString().padStart(2, '0')}/${fim.getFullYear()}`
  }

  const navegarSemana = (direcao: 'anterior' | 'proximo') => {
    const novaData = new Date(dataSelecionada)
    if (direcao === 'anterior') {
      novaData.setDate(novaData.getDate() - 7)
    } else {
      novaData.setDate(novaData.getDate() + 7)
    }
    onDataChange(novaData)
  }

  const obterAgendamentoPorDiaHorario = (dia: Date, horario: string) => {
    const [hora] = horario.split(':').map(Number)
    return agendamentos.filter(agendamento => {
      const dataAgendamento = new Date(agendamento.dataHora)
      return (
        dataAgendamento.getDate() === dia.getDate() &&
        dataAgendamento.getMonth() === dia.getMonth() &&
        dataAgendamento.getFullYear() === dia.getFullYear() &&
        dataAgendamento.getHours() === hora
      )
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'agendado':
        return 'bg-blue-50 border-blue-200 text-blue-800'
      case 'concluido':
        return 'bg-green-50 border-green-200 text-green-800'
      case 'cancelado':
        return 'bg-red-50 border-red-200 text-red-800'
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800'
    }
  }

  const isToday = (dia: Date) => {
    const hoje = new Date()
    return (
      dia.getDate() === hoje.getDate() &&
      dia.getMonth() === hoje.getMonth() &&
      dia.getFullYear() === hoje.getFullYear()
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base lg:text-lg">
          Agenda da Semana
        </CardTitle>
        <div className="flex items-center justify-between">
          <Button variant="outline" size="sm" onClick={() => navegarSemana('anterior')}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h3 className="text-sm font-medium text-center flex-1 mx-4">
            {formatSemana()}
          </h3>
          <Button variant="outline" size="sm" onClick={() => navegarSemana('proximo')}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          {/* Cabeçalho com os dias da semana */}
          <div className="grid grid-cols-8 gap-1 mb-2 min-w-[800px]">
            <div className="w-16"></div> {/* Espaço para os horários */}
            {diasSemana.map((dia, index) => (
              <div
                key={dia.getTime()}
                className={`p-2 text-center text-sm font-medium border rounded cursor-pointer hover:bg-gray-50 ${
                  isToday(dia) ? 'bg-blue-50 border-blue-200 text-blue-800' : 'border-gray-200'
                }`}
                onClick={() => onDiaClick(dia)}
              >
                <div className="text-xs text-gray-500">{nomesDias[index]}</div>
                <div className={`font-semibold ${isToday(dia) ? 'text-blue-800' : ''}`}>
                  {dia.getDate()}
                </div>
              </div>
            ))}
          </div>

          {/* Grid de horários */}
          <div className="space-y-1 min-w-[800px]">
            {horarios.map((horario) => (
              <div key={horario} className="grid grid-cols-8 gap-1 min-h-[60px]">
                <div className="w-16 text-sm text-gray-500 font-medium flex items-center">
                  {horario}
                </div>
                {diasSemana.map((dia) => {
                  const agendamentosDia = obterAgendamentoPorDiaHorario(dia, horario)
                  
                  return (
                    <div key={`${dia.getTime()}-${horario}`} className="border border-gray-100 rounded p-1">
                      {agendamentosDia.length > 0 ? (
                        <div className="space-y-1">
                          {agendamentosDia.slice(0, 2).map((agendamento) => (
                            <div
                              key={agendamento.id}
                              className={`text-xs p-1 rounded border ${getStatusColor(agendamento.status)}`}
                            >
                              <div className="font-medium truncate">
                                {agendamento.cliente.nome}
                              </div>
                              <div className="text-xs truncate">
                                {agendamento.servico.nome}
                              </div>
                            </div>
                          ))}
                          {agendamentosDia.length > 2 && (
                            <div className="text-xs text-gray-500 text-center">
                              +{agendamentosDia.length - 2} mais
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="h-full min-h-[50px] hover:bg-gray-50 cursor-pointer rounded"></div>
                      )}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}