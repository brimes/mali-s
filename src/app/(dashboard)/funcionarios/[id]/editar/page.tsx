'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Save, Loader2, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { ESPECIALIDADES, DIAS_SEMANA } from '@/lib/validations'

interface Funcionario {
  id: string
  nome: string
  telefone: string
  especialidades: string[]
  horarioInicio: string
  horarioFim: string
  diasTrabalho: string[]
  ativo: boolean
}

interface FuncionarioEditarProps {
  params: {
    id: string
  }
}

export default function FuncionarioEditarPage({ params }: FuncionarioEditarProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    nome: '',
    telefone: '',
    especialidades: [] as string[],
    horarioInicio: '',
    horarioFim: '',
    diasTrabalho: [] as string[],
    ativo: true
  })
  const [errors, setErrors] = useState<{[key: string]: string}>({})

  useEffect(() => {
    fetchFuncionario()
  }, [params.id])

  const fetchFuncionario = async () => {
    try {
      const response = await fetch(`/api/funcionarios/${params.id}`)
      if (!response.ok) {
        throw new Error('Funcionário não encontrado')
      }
      const funcionario: Funcionario = await response.json()
      setFormData({
        nome: funcionario.nome,
        telefone: funcionario.telefone,
        especialidades: funcionario.especialidades,
        horarioInicio: funcionario.horarioInicio,
        horarioFim: funcionario.horarioFim,
        diasTrabalho: funcionario.diasTrabalho,
        ativo: funcionario.ativo
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3')
    } else {
      return numbers.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3')
    }
  }

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {}
    
    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório'
    } else if (formData.nome.trim().length < 2) {
      newErrors.nome = 'Nome deve ter pelo menos 2 caracteres'
    }
    
    if (!formData.telefone.trim()) {
      newErrors.telefone = 'Telefone é obrigatório'
    } else if (formData.telefone.replace(/\D/g, '').length < 10) {
      newErrors.telefone = 'Telefone deve ter pelo menos 10 dígitos'
    }
    
    if (formData.especialidades.length === 0) {
      newErrors.especialidades = 'Selecione pelo menos uma especialidade'
    }
    
    if (!formData.horarioInicio) {
      newErrors.horarioInicio = 'Horário de início é obrigatório'
    }
    
    if (!formData.horarioFim) {
      newErrors.horarioFim = 'Horário de fim é obrigatório'
    }
    
    if (formData.horarioInicio && formData.horarioFim) {
      if (formData.horarioInicio >= formData.horarioFim) {
        newErrors.horarioFim = 'Horário de fim deve ser após o horário de início'
      }
    }
    
    if (formData.diasTrabalho.length === 0) {
      newErrors.diasTrabalho = 'Selecione pelo menos um dia de trabalho'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setSaving(true)

    try {
      const dataToSend = {
        ...formData,
        telefone: formData.telefone.replace(/\D/g, '')
      }

      const response = await fetch(`/api/funcionarios/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      })

      if (response.ok) {
        router.push(`/funcionarios/${params.id}`)
      } else {
        const error = await response.json()
        alert('Erro ao atualizar funcionário: ' + error.error)
      }
    } catch (error) {
      alert('Erro ao atualizar funcionário')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Tem certeza que deseja excluir este funcionário? Esta ação não pode ser desfeita.')) {
      return
    }

    setDeleting(true)

    try {
      const response = await fetch(`/api/funcionarios/${params.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        router.push('/funcionarios')
      } else {
        const error = await response.json()
        alert('Erro ao excluir funcionário: ' + error.error)
      }
    } catch (error) {
      alert('Erro ao excluir funcionário')
    } finally {
      setDeleting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target
    
    if (name === 'telefone') {
      const formattedPhone = formatPhone(value)
      setFormData({
        ...formData,
        [name]: formattedPhone
      })
    } else {
      setFormData({
        ...formData,
        [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
      })
    }
    
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      })
    }
  }

  const handleEspecialidadeChange = (especialidade: string) => {
    const newEspecialidades = formData.especialidades.includes(especialidade)
      ? formData.especialidades.filter(e => e !== especialidade)
      : [...formData.especialidades, especialidade]
    
    setFormData({
      ...formData,
      especialidades: newEspecialidades
    })
    
    if (errors.especialidades && newEspecialidades.length > 0) {
      setErrors({
        ...errors,
        especialidades: ''
      })
    }
  }

  const handleDiaTrabalhoChange = (dia: string) => {
    const newDias = formData.diasTrabalho.includes(dia)
      ? formData.diasTrabalho.filter(d => d !== dia)
      : [...formData.diasTrabalho, dia]
    
    setFormData({
      ...formData,
      diasTrabalho: newDias
    })
    
    if (errors.diasTrabalho && newDias.length > 0) {
      setErrors({
        ...errors,
        diasTrabalho: ''
      })
    }
  }

  const getEspecialidadeLabel = (especialidade: string) => {
    const labels: {[key: string]: string} = {
      'corte': 'Corte',
      'pintura': 'Pintura',
      'manicure': 'Manicure',
      'pedicure': 'Pedicure',
      'sobrancelha': 'Sobrancelha',
      'depilacao': 'Depilação',
      'tratamento': 'Tratamento',
      'penteado': 'Penteado',
      'maquiagem': 'Maquiagem'
    }
    return labels[especialidade] || especialidade
  }

  const getDiaLabel = (dia: string) => {
    const labels: {[key: string]: string} = {
      'segunda': 'Segunda-feira',
      'terca': 'Terça-feira',
      'quarta': 'Quarta-feira',
      'quinta': 'Quinta-feira',
      'sexta': 'Sexta-feira',
      'sabado': 'Sábado',
      'domingo': 'Domingo'
    }
    return labels[dia] || dia
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Link href="/funcionarios">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </Link>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-red-600">
              {error}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <Link href={`/funcionarios/${params.id}`}>
          <Button variant="outline" size="sm" className="w-full sm:w-auto">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Editar Funcionário</h1>
          <p className="text-sm lg:text-base text-gray-600">Atualize as informações do funcionário</p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base lg:text-lg">Dados do Funcionário</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nome e Telefone */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nome" className="text-sm lg:text-base">Nome *</Label>
                <Input
                  id="nome"
                  name="nome"
                  value={formData.nome}
                  onChange={handleChange}
                  required
                  placeholder="Nome completo"
                  className={`text-sm lg:text-base ${errors.nome ? 'border-red-500' : ''}`}
                />
                {errors.nome && (
                  <p className="text-red-500 text-xs">{errors.nome}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefone" className="text-sm lg:text-base">Telefone *</Label>
                <Input
                  id="telefone"
                  name="telefone"
                  value={formData.telefone}
                  onChange={handleChange}
                  required
                  placeholder="(11) 99999-9999"
                  maxLength={15}
                  className={`text-sm lg:text-base ${errors.telefone ? 'border-red-500' : ''}`}
                />
                {errors.telefone && (
                  <p className="text-red-500 text-xs">{errors.telefone}</p>
                )}
              </div>
            </div>

            {/* Horários */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="horarioInicio" className="text-sm lg:text-base">Horário de Início *</Label>
                <Input
                  id="horarioInicio"
                  name="horarioInicio"
                  type="time"
                  value={formData.horarioInicio}
                  onChange={handleChange}
                  required
                  className={`text-sm lg:text-base ${errors.horarioInicio ? 'border-red-500' : ''}`}
                />
                {errors.horarioInicio && (
                  <p className="text-red-500 text-xs">{errors.horarioInicio}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="horarioFim" className="text-sm lg:text-base">Horário de Fim *</Label>
                <Input
                  id="horarioFim"
                  name="horarioFim"
                  type="time"
                  value={formData.horarioFim}
                  onChange={handleChange}
                  required
                  className={`text-sm lg:text-base ${errors.horarioFim ? 'border-red-500' : ''}`}
                />
                {errors.horarioFim && (
                  <p className="text-red-500 text-xs">{errors.horarioFim}</p>
                )}
              </div>
            </div>

            {/* Especialidades */}
            <div className="space-y-3">
              <Label className="text-sm lg:text-base">Especialidades *</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {ESPECIALIDADES.map((especialidade) => (
                  <label
                    key={especialidade}
                    className="flex items-center space-x-2 p-2 rounded border hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={formData.especialidades.includes(especialidade)}
                      onChange={() => handleEspecialidadeChange(especialidade)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-sm">{getEspecialidadeLabel(especialidade)}</span>
                  </label>
                ))}
              </div>
              {errors.especialidades && (
                <p className="text-red-500 text-xs">{errors.especialidades}</p>
              )}
            </div>

            {/* Dias de Trabalho */}
            <div className="space-y-3">
              <Label className="text-sm lg:text-base">Dias de Trabalho *</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {DIAS_SEMANA.map((dia) => (
                  <label
                    key={dia}
                    className="flex items-center space-x-2 p-2 rounded border hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={formData.diasTrabalho.includes(dia)}
                      onChange={() => handleDiaTrabalhoChange(dia)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-sm">{getDiaLabel(dia)}</span>
                  </label>
                ))}
              </div>
              {errors.diasTrabalho && (
                <p className="text-red-500 text-xs">{errors.diasTrabalho}</p>
              )}
            </div>

            {/* Status Ativo */}
            <div className="flex items-center space-x-2">
              <input
                id="ativo"
                name="ativo"
                type="checkbox"
                checked={formData.ativo}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <Label htmlFor="ativo" className="text-sm lg:text-base">
                Funcionário ativo (disponível para agendamentos)
              </Label>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
              <Button 
                type="submit" 
                disabled={saving} 
                className="w-full sm:w-auto text-sm lg:text-base"
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
              
              <Link href={`/funcionarios/${params.id}`} className="w-full sm:w-auto">
                <Button type="button" variant="outline" className="w-full text-sm lg:text-base">
                  Cancelar
                </Button>
              </Link>

              <div className="flex-1"></div>

              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={deleting}
                className="w-full sm:w-auto text-sm lg:text-base"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {deleting ? 'Excluindo...' : 'Excluir Funcionário'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}