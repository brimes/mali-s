import { Cliente, Funcionario, Servico, Agendamento } from '@prisma/client'

export type ClienteWithAgendamentos = Cliente & {
  agendamentos: Agendamento[]
}

export type FuncionarioWithAgendamentos = Funcionario & {
  agendamentos: Agendamento[]
}

export type ServicoWithAgendamentos = Servico & {
  agendamentos: Agendamento[]
}

export type AgendamentoComplete = Agendamento & {
  cliente: Cliente
  funcionario: Funcionario
  servico: Servico
}

export interface DashboardStats {
  totalClientes: number
  totalFuncionarios: number
  totalServicos: number
  agendamentosHoje: number
  agendamentosSemana: number
  faturamentoMes: number
}

export interface CalendarEvent {
  id: string
  title: string
  start: Date
  end: Date
  cliente: string
  funcionario: string
  servico: string
  status: string
  preco?: number
}

export interface TimeSlot {
  time: string
  available: boolean
  agendamento?: AgendamentoComplete
}

export interface WorkingHours {
  start: string
  end: string
}

export interface FuncionarioWithEspecialidades extends Omit<Funcionario, 'especialidades' | 'diasTrabalho'> {
  especialidades: string[]
  diasTrabalho: string[]
}