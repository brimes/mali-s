'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Plus, List, Calendar, CalendarDays, CalendarRange } from 'lucide-react'
import Link from 'next/link'
import { 
  AgendamentosLista, 
  CalendarioDia, 
  CalendarioSemana, 
  CalendarioMes 
} from '@/components/agendamentos'
import { ViewType } from '@/types/agendamentos'

// Interface para agendamento da API
interface AgendamentoAPI {
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

export default function AgendamentosPage() {
  const [viewType, setViewType] = useState<ViewType>('dia')
  const [dataSelecionada, setDataSelecionada] = useState(new Date())
  const [agendamentos, setAgendamentos] = useState<AgendamentoAPI[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAgendamentos()
    
    // Recarregar agendamentos quando voltar da página de criação
    const handleFocus = () => {
      loadAgendamentos()
    }
    
    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [])

  const loadAgendamentos = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/agendamentos')
      if (response.ok) {
        const data = await response.json()
        setAgendamentos(data)
      } else {
        console.error('Erro ao carregar agendamentos')
      }
    } catch (error) {
      console.error('Erro ao carregar agendamentos:', error)
    } finally {
      setLoading(false)
    }
  }

  // Converter agendamentos da API para o formato esperado pelos componentes
  const agendamentosConvertidos = agendamentos.map(agendamento => ({
    ...agendamento,
    dataHora: new Date(agendamento.dataHora)
  }))

  const handleDiaClick = (data: Date) => {
    setDataSelecionada(data)
    setViewType('dia')
  }

  const views = [
    { id: 'dia', label: 'Dia', icon: Calendar },
    { id: 'semana', label: 'Semana', icon: CalendarDays },
    { id: 'mes', label: 'Mês', icon: CalendarRange },
    { id: 'lista', label: 'Lista', icon: List },
  ]

  const renderView = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-8">
          <p>Carregando agendamentos...</p>
        </div>
      )
    }

    switch (viewType) {
      case 'lista':
        return <AgendamentosLista agendamentos={agendamentosConvertidos} />
      case 'dia':
        return (
          <CalendarioDia
            agendamentos={agendamentosConvertidos}
            dataSelecionada={dataSelecionada}
            onDataChange={setDataSelecionada}
          />
        )
      case 'semana':
        return (
          <CalendarioSemana
            agendamentos={agendamentosConvertidos}
            dataSelecionada={dataSelecionada}
            onDataChange={setDataSelecionada}
            onDiaClick={handleDiaClick}
          />
        )
      case 'mes':
        return (
          <CalendarioMes
            agendamentos={agendamentosConvertidos}
            dataSelecionada={dataSelecionada}
            onDataChange={setDataSelecionada}
            onDiaClick={handleDiaClick}
          />
        )
      default:
        return <AgendamentosLista agendamentos={agendamentosConvertidos} />
    }
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Agendamentos</h1>
          <p className="text-sm lg:text-base text-gray-600">Gerencie todos os agendamentos</p>
        </div>
        <Link href="/agendamentos/novo">
          <Button className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Novo Agendamento
          </Button>
        </Link>
      </div>

      {/* View Navigation */}
      <div className="flex flex-wrap gap-2 p-1 bg-gray-100 rounded-lg w-fit">
        {views.map(({ id, label, icon: Icon }) => (
          <Button
            key={id}
            variant={viewType === id ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setViewType(id as ViewType)}
            className={`flex items-center gap-2 ${
              viewType === id 
                ? 'bg-white shadow-sm text-gray-900 hover:bg-white hover:text-gray-900' 
                : 'hover:bg-white/50 text-gray-600 hover:text-gray-900'
            }`}
          >
            <Icon className="h-4 w-4" />
            <span className="hidden sm:inline">{label}</span>
          </Button>
        ))}
      </div>

      {/* View Content */}
      {renderView()}
    </div>
  )
}