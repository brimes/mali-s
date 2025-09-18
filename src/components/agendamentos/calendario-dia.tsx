'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { CalendarioProps } from '@/types/agendamentos'

interface CalendarioDiaProps extends CalendarioProps {}

export function CalendarioDia({ agendamentos, dataSelecionada, onDataChange }: CalendarioDiaProps) {
  // Gerar horários das 7h às 20h (a cada 30 minutos)
  const gerarHorarios = () => {
    const horarios = []
    for (let hora = 7; hora <= 20; hora++) {
      horarios.push(`${hora.toString().padStart(2, '0')}:00`)
      if (hora < 20) {
        horarios.push(`${hora.toString().padStart(2, '0')}:30`)
      }
    }
    return horarios
  }

  const horarios = gerarHorarios()

  // Obter lista única de funcionários dos agendamentos
  const obterFuncionarios = () => {
    const funcionariosSet = new Set()
    agendamentos.forEach(agendamento => {
      const dataAgendamento = new Date(agendamento.dataHora)
      // Verificar se o agendamento é do dia selecionado
      if (
        dataAgendamento.getDate() === dataSelecionada.getDate() &&
        dataAgendamento.getMonth() === dataSelecionada.getMonth() &&
        dataAgendamento.getFullYear() === dataSelecionada.getFullYear()
      ) {
        funcionariosSet.add(JSON.stringify({
          id: agendamento.funcionario.id,
          nome: agendamento.funcionario.nome
        }))
      }
    })
    
    return Array.from(funcionariosSet).map(funcionarioStr => JSON.parse(funcionarioStr as string))
  }

  const funcionarios = obterFuncionarios()

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date)
  }

  const navegarDia = (direcao: 'anterior' | 'proximo') => {
    const novaData = new Date(dataSelecionada)
    if (direcao === 'anterior') {
      novaData.setDate(novaData.getDate() - 1)
    } else {
      novaData.setDate(novaData.getDate() + 1)
    }
    onDataChange(novaData)
  }

  const obterAgendamentoPorFuncionarioHorario = (funcionarioId: string, horario: string) => {
    const [hora, minuto] = horario.split(':').map(Number)
    return agendamentos.find(agendamento => {
      const dataAgendamento = new Date(agendamento.dataHora)
      return (
        agendamento.funcionario.id === funcionarioId &&
        dataAgendamento.getDate() === dataSelecionada.getDate() &&
        dataAgendamento.getMonth() === dataSelecionada.getMonth() &&
        dataAgendamento.getFullYear() === dataSelecionada.getFullYear() &&
        dataAgendamento.getHours() === hora && 
        dataAgendamento.getMinutes() === minuto
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base lg:text-lg">
          Agenda do Dia
        </CardTitle>
        <div className="flex items-center justify-between">
          <Button variant="outline" size="sm" onClick={() => navegarDia('anterior')}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h3 className="text-sm font-medium capitalize text-center flex-1 mx-4">
            {formatDate(dataSelecionada)}
          </h3>
          <Button variant="outline" size="sm" onClick={() => navegarDia('proximo')}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {funcionarios.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>Nenhum agendamento para este dia</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className={`grid gap-4 min-w-[600px]`} style={{ gridTemplateColumns: `80px repeat(${funcionarios.length}, 1fr)` }}>
              {/* Cabeçalho */}
              <div className="font-medium text-sm text-gray-600 sticky left-0 bg-white">
                Horário
              </div>
              {funcionarios.map((funcionario) => (
                <div key={funcionario.id} className="font-medium text-sm text-center text-gray-800 border-b pb-2">
                  {funcionario.nome}
                </div>
              ))}

              {/* Grid de horários */}
              {horarios.map((horario) => (
                <>
                  <div key={`time-${horario}`} className="text-sm text-gray-500 font-medium py-3 sticky left-0 bg-white border-r">
                    {horario}
                  </div>
                  {funcionarios.map((funcionario) => {
                    const agendamento = obterAgendamentoPorFuncionarioHorario(funcionario.id, horario)
                    
                    return (
                      <div key={`${funcionario.id}-${horario}`} className="min-h-[60px] border-b border-gray-100 p-1">
                        {agendamento ? (
                          <div className={`p-2 rounded-lg border h-full ${getStatusColor(agendamento.status)}`}>
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="font-medium text-sm">
                                  {agendamento.cliente.nome}
                                </div>
                                <div className="text-xs text-gray-600 mt-1">
                                  {agendamento.servico.nome}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                  {agendamento.servico.duracao} min
                                </div>
                              </div>
                              <Link href={`/agendamentos/${agendamento.id}`}>
                                <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                                  Ver
                                </Button>
                              </Link>
                            </div>
                          </div>
                        ) : (
                          <div className="h-full min-h-[56px] border border-dashed border-gray-200 rounded-lg hover:border-gray-300 cursor-pointer flex items-center justify-center">
                            <span className="text-xs text-gray-400">Disponível</span>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}