export interface Agendamento {
  id: string
  dataHora: Date
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
  status: string
  observacoes?: string
}

export type ViewType = 'lista' | 'dia' | 'semana' | 'mes'

export interface CalendarioProps {
  agendamentos: Agendamento[]
  dataSelecionada: Date
  onDataChange: (data: Date) => void
}

export interface CalendarioNavigationProps extends CalendarioProps {
  onDiaClick: (data: Date) => void
}