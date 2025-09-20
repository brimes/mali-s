'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { Alert } from '@/components/ui/alert'
import { ArrowLeft, Calendar, Clock, User, Scissors } from 'lucide-react'
import Link from 'next/link'

interface Cliente {
  id: string
  nome: string
  telefone: string
}

interface Funcionario {
  id: string
  nome: string
  especialidades: string[]
}

interface Servico {
  id: string
  nome: string
  duracao: number
  preco: number
  categoria: string
}

export default function NovoAgendamentoPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([])
  const [servicos, setServicos] = useState<Servico[]>([])

  const [formData, setFormData] = useState({
    dataHora: '',
    clienteId: '',
    funcionarioId: '',
    servicoId: '',
    observacoes: ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    // Carregar dados necessários para o formulário
    loadFormData()
    
    // Verificar se há parâmetros da URL (vindos da seleção do calendário)
    processarParametrosURL()
  }, [])

  const processarParametrosURL = () => {
    const funcionarioId = searchParams.get('funcionarioId')
    const dataInicio = searchParams.get('dataInicio')
    const dataFim = searchParams.get('dataFim')
    const duracao = searchParams.get('duracao')
    
    if (funcionarioId && dataInicio) {
      setFormData(prev => ({
        ...prev,
        funcionarioId,
        dataHora: dataInicio
      }))
    }
  }

  const loadFormData = async () => {
    try {
      const [clientesRes, funcionariosRes, servicosRes] = await Promise.all([
        fetch('/api/clientes'),
        fetch('/api/funcionarios'),
        fetch('/api/servicos')
      ])

      if (clientesRes.ok) {
        const clientesData = await clientesRes.json()
        setClientes(clientesData)
      }

      if (funcionariosRes.ok) {
        const funcionariosData = await funcionariosRes.json()
        setFuncionarios(funcionariosData)
      }

      if (servicosRes.ok) {
        const servicosData = await servicosRes.json()
        setServicos(servicosData)
      }
    } catch (error) {
      console.error('Erro ao carregar dados do formulário:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})

    try {
      const response = await fetch('/api/agendamentos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        router.push('/agendamentos')
      } else {
        const errorData = await response.json()
        if (errorData.errors) {
          setErrors(errorData.errors)
        } else {
          setErrors({ submit: errorData.error || 'Erro ao criar agendamento' })
        }
      }
    } catch (error) {
      setErrors({ submit: 'Erro ao criar agendamento' })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const selectedServico = servicos.find(s => s.id === formData.servicoId)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/agendamentos">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Novo Agendamento</h1>
          <p className="text-sm lg:text-base text-gray-600">Preencha os dados para criar um novo agendamento</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações do Agendamento</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Data e Hora */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="dataHora" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Data e Hora
                </Label>
                <Input
                  id="dataHora"
                  type="datetime-local"
                  value={formData.dataHora}
                  onChange={(e) => handleChange('dataHora', e.target.value)}
                  className={errors.dataHora ? 'border-red-500' : ''}
                  required
                />
                {errors.dataHora && (
                  <p className="text-sm text-red-500 mt-1">{errors.dataHora}</p>
                )}
              </div>
            </div>

            {/* Cliente */}
            <div>
              <Label htmlFor="clienteId" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Cliente
              </Label>
              <Select
                id="clienteId"
                value={formData.clienteId}
                onChange={(e) => handleChange('clienteId', e.target.value)}
                error={!!errors.clienteId}
                required
              >
                <option value="">Selecione um cliente</option>
                {clientes.map((cliente) => (
                  <option key={cliente.id} value={cliente.id}>
                    {cliente.nome} - {cliente.telefone}
                  </option>
                ))}
              </Select>
              {errors.clienteId && (
                <p className="text-sm text-red-500 mt-1">{errors.clienteId}</p>
              )}
            </div>

            {/* Serviço */}
            <div>
              <Label htmlFor="servicoId" className="flex items-center gap-2">
                <Scissors className="h-4 w-4" />
                Serviço
              </Label>
              <Select
                id="servicoId"
                value={formData.servicoId}
                onChange={(e) => handleChange('servicoId', e.target.value)}
                error={!!errors.servicoId}
                required
              >
                <option value="">Selecione um serviço</option>
                {servicos.map((servico) => (
                  <option key={servico.id} value={servico.id}>
                    {servico.nome} - {servico.duracao}min - R$ {servico.preco.toFixed(2)}
                  </option>
                ))}
              </Select>
              {errors.servicoId && (
                <p className="text-sm text-red-500 mt-1">{errors.servicoId}</p>
              )}
              {selectedServico && (
                <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                  <p><strong>Duração:</strong> {selectedServico.duracao} minutos</p>
                  <p><strong>Preço:</strong> R$ {selectedServico.preco.toFixed(2)}</p>
                  <p><strong>Categoria:</strong> {selectedServico.categoria}</p>
                </div>
              )}
            </div>

            {/* Funcionário */}
            <div>
              <Label htmlFor="funcionarioId" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Funcionário
              </Label>
              <Select
                id="funcionarioId"
                value={formData.funcionarioId}
                onChange={(e) => handleChange('funcionarioId', e.target.value)}
                error={!!errors.funcionarioId}
                required
              >
                <option value="">Selecione um funcionário</option>
                {funcionarios.map((funcionario) => (
                  <option key={funcionario.id} value={funcionario.id}>
                    {funcionario.nome}
                  </option>
                ))}
              </Select>
              {errors.funcionarioId && (
                <p className="text-sm text-red-500 mt-1">{errors.funcionarioId}</p>
              )}
            </div>

            {/* Observações */}
            <div>
              <Label htmlFor="observacoes">Observações (opcional)</Label>
              <Textarea
                id="observacoes"
                value={formData.observacoes}
                onChange={(e) => handleChange('observacoes', e.target.value)}
                placeholder="Observações adicionais sobre o agendamento..."
                rows={3}
              />
            </div>

            {/* Erro geral */}
            {errors.submit && (
              <Alert variant="error">
                {errors.submit}
              </Alert>
            )}

            {/* Botões */}
            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 sm:flex-none"
              >
                {loading ? 'Criando...' : 'Criar Agendamento'}
              </Button>
              <Link href="/agendamentos">
                <Button variant="outline" className="flex-1 sm:flex-none">
                  Cancelar
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}