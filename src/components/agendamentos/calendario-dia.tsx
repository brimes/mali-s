'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { CalendarioProps } from '@/types/agendamentos'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

interface CalendarioDiaProps {
  dataSelecionada: Date
  onDataChange: (data: Date) => void
}

interface FuncionarioDia {
  id: string
  nome: string
}

interface AgendamentoDia {
  id: string
  dataHora: string
  status: string
  observacoes?: string
  preco?: number
  cliente: {
    id: string
    nome: string
    telefone: string
  }
  funcionario: {
    id: string
    nome: string
  }
  servico: {
    id: string
    nome: string
    duracao: number
    preco: number
  }
}

interface PaginacaoInfo {
  paginaAtual: number
  totalPaginas: number
  totalFuncionarios: number
  funcionariosPorPagina: number
  temProximaPagina: boolean
  temPaginaAnterior: boolean
}

interface DadosDia {
  funcionarios: FuncionarioDia[]
  agendamentos: AgendamentoDia[]
  paginacao: PaginacaoInfo
}

interface SelecaoHorario {
  funcionarioId: string | null
  horarioInicio: string | null
  horarioFim: string | null
  ativo: boolean
}

export function CalendarioDia({ dataSelecionada, onDataChange }: CalendarioDiaProps) {
  const router = useRouter()
  const [dadosDia, setDadosDia] = useState<DadosDia | null>(null)
  const [loading, setLoading] = useState(true)
  const [paginaAtual, setPaginaAtual] = useState(1)
  const [selecao, setSelecao] = useState<SelecaoHorario>({
    funcionarioId: null,
    horarioInicio: null,
    horarioFim: null,
    ativo: false
  })
  const [isDragging, setIsDragging] = useState(false)

  // Carregar dados quando data ou página mudarem
  useEffect(() => {
    carregarDadosDia()
  }, [dataSelecionada, paginaAtual])

  const carregarDadosDia = async () => {
    try {
      setLoading(true)
      // Formatar data usando timezone local para evitar problemas com UTC
      const ano = dataSelecionada.getFullYear()
      const mes = String(dataSelecionada.getMonth() + 1).padStart(2, '0')
      const dia = String(dataSelecionada.getDate()).padStart(2, '0')
      const dataFormatada = `${ano}-${mes}-${dia}`
      
      const response = await fetch(`/api/agendamentos/dia?data=${dataFormatada}&pagina=${paginaAtual}`)
      
      if (response.ok) {
        const data = await response.json()
        setDadosDia(data)
      } else {
        console.error('Erro ao carregar dados do dia')
        setDadosDia(null)
      }
    } catch (error) {
      console.error('Erro ao carregar dados do dia:', error)
      setDadosDia(null)
    } finally {
      setLoading(false)
    }
  }

  // Resetar página ao mudar data
  useEffect(() => {
    setPaginaAtual(1)
    limparSelecao() // Limpar seleção ao mudar data
  }, [dataSelecionada])

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

  const navegarPagina = (direcao: 'anterior' | 'proxima') => {
    if (direcao === 'anterior' && dadosDia?.paginacao.temPaginaAnterior) {
      setPaginaAtual(prev => prev - 1)
    } else if (direcao === 'proxima' && dadosDia?.paginacao.temProximaPagina) {
      setPaginaAtual(prev => prev + 1)
    }
  }

  // Funções para manipular seleção de horários
  const iniciarSelecao = (funcionarioId: string, horario: string) => {
    // Verificar se já tem agendamento neste horário (ocupado por qualquer agendamento)
    const agendamentoOcupando = obterAgendamentoPorFuncionarioHorario(funcionarioId, horario)
    if (agendamentoOcupando) return // Não permitir seleção em horários ocupados

    setSelecao({
      funcionarioId,
      horarioInicio: horario,
      horarioFim: horario,
      ativo: true
    })
    setIsDragging(true)
  }

  const atualizarSelecao = (funcionarioId: string, horario: string) => {
    if (!isDragging || !selecao.ativo || selecao.funcionarioId !== funcionarioId) return

    // Verificar se o horário está ocupado
    const agendamentoOcupando = obterAgendamentoPorFuncionarioHorario(funcionarioId, horario)
    if (agendamentoOcupando) return // Não permitir estender seleção sobre horários ocupados

    const horarios = gerarHorarios()
    const indiceInicio = horarios.indexOf(selecao.horarioInicio!)
    const indiceAtual = horarios.indexOf(horario)

    if (indiceAtual >= indiceInicio) {
      setSelecao(prev => ({ ...prev, horarioFim: horario }))
    }
  }

  const finalizarSelecao = () => {
    if (!selecao.ativo || !selecao.funcionarioId || !selecao.horarioInicio || !selecao.horarioFim) {
      limparSelecao()
      return
    }

    // Calcular data e hora de início e fim
    const [horaInicio, minutoInicio] = selecao.horarioInicio.split(':').map(Number)
    const [horaFim, minutoFim] = selecao.horarioFim.split(':').map(Number)
    
    // Criar datas locais sem conversão UTC
    const ano = dataSelecionada.getFullYear()
    const mes = dataSelecionada.getMonth()
    const dia = dataSelecionada.getDate()
    
    const dataInicio = new Date(ano, mes, dia, horaInicio, minutoInicio, 0, 0)
    const dataFim = new Date(ano, mes, dia, horaFim, minutoFim + 30, 0, 0)
    
    // Calcular duração em minutos
    const duracaoMinutos = (dataFim.getTime() - dataInicio.getTime()) / (1000 * 60)

    // Criar string de data/hora no formato local (sem conversão UTC)
    const dataInicioStr = `${ano}-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}T${String(horaInicio).padStart(2, '0')}:${String(minutoInicio).padStart(2, '0')}`
    const dataFimStr = `${ano}-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}T${String(horaFim).padStart(2, '0')}:${String(minutoFim + 30).padStart(2, '0')}`

    // Navegar para página de novo agendamento com parâmetros
    const params = new URLSearchParams({
      funcionarioId: selecao.funcionarioId,
      dataInicio: dataInicioStr,
      dataFim: dataFimStr,
      duracao: duracaoMinutos.toString()
    })

    router.push(`/agendamentos/novo?${params.toString()}`)
    limparSelecao()
  }

  const limparSelecao = () => {
    setSelecao({
      funcionarioId: null,
      horarioInicio: null,
      horarioFim: null,
      ativo: false
    })
    setIsDragging(false)
  }

  // Verificar se um horário está dentro da seleção
  const estaNoIntervaloSelecionado = (funcionarioId: string, horario: string): boolean => {
    if (!selecao.ativo || selecao.funcionarioId !== funcionarioId) return false
    
    const horarios = gerarHorarios()
    const indiceHorario = horarios.indexOf(horario)
    const indiceInicio = horarios.indexOf(selecao.horarioInicio!)
    const indiceFim = horarios.indexOf(selecao.horarioFim!)
    
    return indiceHorario >= indiceInicio && indiceHorario <= indiceFim
  }

  // Event listeners globais para mouse
  useEffect(() => {
    const handleMouseUp = () => {
      if (isDragging) {
        finalizarSelecao()
      }
    }

    const handleMouseLeave = () => {
      if (isDragging) {
        limparSelecao()
      }
    }

    if (isDragging) {
      document.addEventListener('mouseup', handleMouseUp)
      document.addEventListener('mouseleave', handleMouseLeave)
    }

    return () => {
      document.removeEventListener('mouseup', handleMouseUp)
      document.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [isDragging])

  // Função para verificar se um slot é o início de um agendamento
  const obterAgendamentoIniciandoNoHorario = (funcionarioId: string, horario: string) => {
    if (!dadosDia?.agendamentos) return null
    
    const [horaAtual, minutoAtual] = horario.split(':').map(Number)
    
    return dadosDia.agendamentos.find(agendamento => {
      // Verificar se é do mesmo funcionário
      if (agendamento.funcionario.id !== funcionarioId) return false
      
      // Converter UTC para horário local do Brasil - CORRIGIR TIMEZONE
      const dataAgendamento = new Date(agendamento.dataHora)
      // Adicionar 3 horas para compensar a diferença UTC -> BRT
      const dataLocal = new Date(dataAgendamento.getTime() + (3 * 60 * 60 * 1000))
      
      // Comparar usando apenas a data em formato string para evitar problemas de timezone
      const dataAgendamentoStr = dataLocal.toISOString().split('T')[0]
      const dataSelecionadaStr = dataSelecionada.toISOString().split('T')[0]
      
      // Verificar se é do mesmo dia
      if (dataAgendamentoStr !== dataSelecionadaStr) return false
      
      // Verificar se o agendamento INICIA exatamente neste horário (usando horário corrigido)
      return dataLocal.getHours() === horaAtual && dataLocal.getMinutes() === minutoAtual
    })
  }

  // Função para calcular quantos slots de 30min um agendamento ocupa
  const calcularSlotsOcupados = (agendamento: AgendamentoDia) => {
    return Math.ceil(agendamento.servico.duracao / 30)
  }

  // Função para verificar se um horário está ocupado por algum agendamento (mas não necessariamente iniciando)
  const obterAgendamentoPorFuncionarioHorario = (funcionarioId: string, horario: string) => {
    if (!dadosDia?.agendamentos) return null
    
    const [horaAtual, minutoAtual] = horario.split(':').map(Number)
    
    // Criar momento atual do horário que estamos verificando
    const momentoAtual = new Date(dataSelecionada)
    momentoAtual.setHours(horaAtual, minutoAtual, 0, 0)
    
    return dadosDia.agendamentos.find(agendamento => {
      // Verificar se é do mesmo funcionário
      if (agendamento.funcionario.id !== funcionarioId) return false
      
      // Converter UTC para horário local do Brasil - CORRIGIR TIMEZONE
      const dataAgendamento = new Date(agendamento.dataHora)
      // Adicionar 3 horas para compensar a diferença UTC -> BRT
      const dataLocal = new Date(dataAgendamento.getTime() + (3 * 60 * 60 * 1000))
      
      // Comparar usando apenas a data em formato string para evitar problemas de timezone
      const dataAgendamentoStr = dataLocal.toISOString().split('T')[0]
      const dataSelecionadaStr = dataSelecionada.toISOString().split('T')[0]
      
      // Verificar se é do mesmo dia
      if (dataAgendamentoStr !== dataSelecionadaStr) return false
      
      // Calcular horário de início e fim do agendamento (usando horário corrigido)
      const inicioAgendamento = new Date(dataSelecionada)
      inicioAgendamento.setHours(dataLocal.getHours(), dataLocal.getMinutes(), 0, 0)
      
      const fimAgendamento = new Date(inicioAgendamento)
      fimAgendamento.setMinutes(fimAgendamento.getMinutes() + agendamento.servico.duracao)
      
      // Verificar se o horário atual está dentro da duração do agendamento
      // O horário atual está ocupado se estiver entre início (inclusive) e fim (exclusive)
      return momentoAtual >= inicioAgendamento && momentoAtual < fimAgendamento
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

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base lg:text-lg">
            Agenda do Dia
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <p>Carregando agenda...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const funcionarios = dadosDia?.funcionarios || []
  const paginacao = dadosDia?.paginacao

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
        {paginacao && paginacao.totalPaginas > 1 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navegarPagina('anterior')}
              disabled={!paginacao.temPaginaAnterior}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Anterior
            </Button>
            <div className="text-sm text-gray-600">
              {paginacao.funcionariosPorPagina * (paginacao.paginaAtual - 1) + 1} - {Math.min(paginacao.funcionariosPorPagina * paginacao.paginaAtual, paginacao.totalFuncionarios)} de {paginacao.totalFuncionarios} funcionários
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navegarPagina('proxima')}
              disabled={!paginacao.temProximaPagina}
            >
              Próxima
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        )}
        {selecao.ativo && selecao.horarioInicio && selecao.horarioFim && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="text-sm font-medium text-blue-800">
              Selecionado: {selecao.horarioInicio} - {selecao.horarioFim}
            </div>
            <div className="text-xs text-blue-600 mt-1">
              Solte o mouse para criar agendamento
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {funcionarios.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>Nenhum funcionário encontrado</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className={`grid gap-1 min-w-[600px]`} style={{ gridTemplateColumns: `70px repeat(${funcionarios.length}, 1fr)` }}>
              {/* Cabeçalho */}
              <div className="font-medium text-xs text-gray-600 sticky left-0 bg-white pb-1">
                Horário
              </div>
              {funcionarios.map((funcionario) => (
                <div key={funcionario.id} className="font-medium text-xs text-center text-gray-800 border-b pb-1">
                  {funcionario.nome}
                </div>
              ))}

              {/* Grid de horários */}
              {horarios.map((horario) => (
                <>
                  <div key={`time-${horario}`} className="text-xs text-gray-500 font-medium py-1.5 sticky left-0 bg-white border-r">
                    {horario}
                  </div>
                  {funcionarios.map((funcionario) => {
                    const agendamentoIniciando = obterAgendamentoIniciandoNoHorario(funcionario.id, horario)
                    const agendamentoOcupando = obterAgendamentoPorFuncionarioHorario(funcionario.id, horario)
                    const estaSelecionado = estaNoIntervaloSelecionado(funcionario.id, horario)
                    
                    return (
                      <div key={`${funcionario.id}-${horario}`} className="min-h-[40px] border-b border-gray-100 p-0.5 relative">
                        {agendamentoIniciando ? (
                          <div 
                            className={`p-1.5 rounded border text-xs ${getStatusColor(agendamentoIniciando.status)} absolute top-0.5 left-0.5 right-0.5 z-10`}
                            style={{
                              height: `${calcularSlotsOcupados(agendamentoIniciando) * 40 - 4}px`
                            }}
                          >
                            <div className="flex justify-between items-start h-full">
                              <div className="flex-1">
                                <div className="font-medium text-xs leading-tight">
                                  {agendamentoIniciando.cliente.nome}
                                </div>
                                <div className="text-xs text-gray-600 mt-0.5 leading-tight">
                                  {agendamentoIniciando.servico.nome}
                                </div>
                                <div className="text-xs text-gray-500 mt-0.5">
                                  {agendamentoIniciando.servico.duracao}min
                                </div>
                              </div>
                              <Link href={`/agendamentos/${agendamentoIniciando.id}`}>
                                <Button variant="ghost" size="sm" className="h-5 px-1 text-xs">
                                  Ver
                                </Button>
                              </Link>
                            </div>
                          </div>
                        ) : agendamentoOcupando ? (
                          // Slot ocupado por agendamento que começou antes
                          <div className="h-full min-h-[36px] bg-gray-100 border border-gray-200 rounded flex items-center justify-center">
                            <span className="text-xs text-gray-500">Ocupado</span>
                          </div>
                        ) : (
                          <div 
                            className={`h-full min-h-[36px] border rounded cursor-pointer flex items-center justify-center select-none transition-colors ${
                              estaSelecionado 
                                ? 'border-blue-400 bg-blue-50 text-blue-700' 
                                : 'border-dashed border-gray-200 hover:border-gray-300'
                            }`}
                            onMouseDown={(e) => {
                              e.preventDefault()
                              iniciarSelecao(funcionario.id, horario)
                            }}
                            onMouseEnter={() => {
                              if (isDragging) {
                                atualizarSelecao(funcionario.id, horario)
                              }
                            }}
                          >
                            <span className="text-xs text-gray-400 pointer-events-none">
                              {estaSelecionado ? '✓' : 'Livre'}
                            </span>
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