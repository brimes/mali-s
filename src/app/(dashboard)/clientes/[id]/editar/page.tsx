'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, Save, Loader2, Trash2 } from 'lucide-react'
import Link from 'next/link'

interface Cliente {
  id: string
  nome: string
  telefone: string
  email: string | null
  observacoes: string | null
}

interface ClienteEditarProps {
  params: {
    id: string
  }
}

export default function ClienteEditarPage({ params }: ClienteEditarProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    nome: '',
    telefone: '',
    email: '',
    observacoes: ''
  })
  const [errors, setErrors] = useState<{[key: string]: string}>({})

  useEffect(() => {
    fetchCliente()
  }, [params.id])

  const fetchCliente = async () => {
    try {
      const response = await fetch(`/api/clientes/${params.id}`)
      if (!response.ok) {
        throw new Error('Cliente não encontrado')
      }
      const cliente: Cliente = await response.json()
      setFormData({
        nome: cliente.nome,
        telefone: cliente.telefone,
        email: cliente.email || '',
        observacoes: cliente.observacoes || ''
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
    
    if (formData.email && formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Email inválido'
      }
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

      const response = await fetch(`/api/clientes/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      })

      if (response.ok) {
        router.push(`/clientes/${params.id}`)
      } else {
        const error = await response.json()
        alert('Erro ao atualizar cliente: ' + error.error)
      }
    } catch (error) {
      alert('Erro ao atualizar cliente')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita.')) {
      return
    }

    setDeleting(true)

    try {
      const response = await fetch(`/api/clientes/${params.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        router.push('/clientes')
      } else {
        const error = await response.json()
        alert('Erro ao excluir cliente: ' + error.error)
      }
    } catch (error) {
      alert('Erro ao excluir cliente')
    } finally {
      setDeleting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    
    if (name === 'telefone') {
      const formattedPhone = formatPhone(value)
      setFormData({
        ...formData,
        [name]: formattedPhone
      })
    } else {
      setFormData({
        ...formData,
        [name]: value
      })
    }
    
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      })
    }
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
        <Link href="/clientes">
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
        <Link href={`/clientes/${params.id}`}>
          <Button variant="outline" size="sm" className="w-full sm:w-auto">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Editar Cliente</h1>
          <p className="text-sm lg:text-base text-gray-600">Atualize as informações do cliente</p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base lg:text-lg">Dados do Cliente</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-6">
            {/* Name and Phone Row */}
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

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm lg:text-base">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="cliente@email.com"
                className={`text-sm lg:text-base ${errors.email ? 'border-red-500' : ''}`}
              />
              {errors.email && (
                <p className="text-red-500 text-xs">{errors.email}</p>
              )}
            </div>

            {/* Observations */}
            <div className="space-y-2">
              <Label htmlFor="observacoes" className="text-sm lg:text-base">Observações</Label>
              <Textarea
                id="observacoes"
                name="observacoes"
                value={formData.observacoes}
                onChange={handleChange}
                placeholder="Observações sobre o cliente..."
                rows={3}
                className="text-sm lg:text-base resize-none"
              />
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
              
              <Link href={`/clientes/${params.id}`} className="w-full sm:w-auto">
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
                {deleting ? 'Excluindo...' : 'Excluir Cliente'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}