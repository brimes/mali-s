import { z } from 'zod'

// Cliente validations
export const clienteSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  telefone: z.string().min(10, 'Telefone deve ter pelo menos 10 dígitos'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  observacoes: z.string().optional(),
})

export type ClienteFormData = z.infer<typeof clienteSchema>

// Funcionário validations
export const funcionarioSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  telefone: z.string().min(10, 'Telefone deve ter pelo menos 10 dígitos'),
  especialidades: z.array(z.string()).min(1, 'Selecione pelo menos uma especialidade'),
  horarioInicio: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato inválido (HH:MM)'),
  horarioFim: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato inválido (HH:MM)'),
  diasTrabalho: z.array(z.string()).min(1, 'Selecione pelo menos um dia'),
  ativo: z.boolean().default(true),
})

export type FuncionarioFormData = z.infer<typeof funcionarioSchema>

// Serviço validations
export const servicoSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  descricao: z.string().optional(),
  duracao: z.number().min(15, 'Duração mínima de 15 minutos'),
  preco: z.number().min(0.01, 'Preço deve ser maior que zero'),
  categoria: z.string().min(1, 'Categoria é obrigatória'),
  ativo: z.boolean().default(true),
})

export type ServicoFormData = z.infer<typeof servicoSchema>

// Agendamento validations
export const agendamentoSchema = z.object({
  dataHora: z.date(),
  clienteId: z.string().min(1, 'Cliente é obrigatório'),
  funcionarioId: z.string().min(1, 'Funcionário é obrigatório'),
  servicoId: z.string().min(1, 'Serviço é obrigatório'),
  status: z.enum(['agendado', 'concluido', 'cancelado']).default('agendado'),
  observacoes: z.string().optional(),
  preco: z.number().positive().optional(),
})

export type AgendamentoFormData = z.infer<typeof agendamentoSchema>

// Constants
export const ESPECIALIDADES = [
  'corte',
  'pintura',
  'manicure',
  'pedicure',
  'sobrancelha',
  'depilacao',
  'tratamento',
  'penteado',
  'maquiagem',
] as const

export const DIAS_SEMANA = [
  'segunda',
  'terca',
  'quarta',
  'quinta',
  'sexta',
  'sabado',
  'domingo',
] as const

export const CATEGORIAS_SERVICO = [
  'cabelo',
  'unha',
  'sobrancelha',
  'depilacao',
  'estetica',
  'tratamento',
] as const

export const STATUS_AGENDAMENTO = [
  'agendado',
  'concluido',
  'cancelado',
] as const