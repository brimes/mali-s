'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'
import { CATEGORIAS_SERVICO } from '@/lib/validations'

export default function NovoServicoPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    duracao: '',
    preco: '',
    categoria: '',
    ativo: true
  })
  const [errors, setErrors] = useState<{[key: string]: string}>({})

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {}
    
    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório'
    } else if (formData.nome.trim().length < 2) {
      newErrors.nome = 'Nome deve ter pelo menos 2 caracteres'
    }
    
    if (!formData.duracao.trim()) {
      newErrors.duracao = 'Duração é obrigatória'
    } else {
      const duracao = parseInt(formData.duracao)
      if (isNaN(duracao) || duracao < 15) {
        newErrors.duracao = 'Duração deve ser pelo menos 15 minutos'
      }
    }
    
    if (!formData.preco.trim()) {
      newErrors.preco = 'Preço é obrigatório'
    } else {
      const preco = parseFloat(formData.preco.replace(',', '.'))
      if (isNaN(preco) || preco <= 0) {
        newErrors.preco = 'Preço deve ser maior que zero'
      }
    }
    
    if (!formData.categoria) {
      newErrors.categoria = 'Categoria é obrigatória'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setLoading(true)

    try {
      const dataToSend = {
        ...formData,
        duracao: parseInt(formData.duracao),
        preco: parseFloat(formData.preco.replace(',', '.'))
      }

      const response = await fetch('/api/servicos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      })

      if (response.ok) {
        router.push('/servicos')
      } else {
        const error = await response.json()
        alert('Erro ao cadastrar serviço: ' + error.error)
      }
    } catch (error) {
      alert('Erro ao cadastrar serviço')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    
    let processedValue = value
    
    // Formatação especial para preço
    if (name === 'preco') {
      // Remove caracteres não numéricos exceto vírgula e ponto
      processedValue = value.replace(/[^\d,\.]/g, '')
    }
    
    // Formatação especial para duração
    if (name === 'duracao') {
      // Remove caracteres não numéricos
      processedValue = value.replace(/\D/g, '')
    }
    
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : processedValue
    })
    
    // Limpar erro do campo quando o usuário começar a digitar
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      })
    }
  }

  const getCategoriaLabel = (categoria: string) => {
    const labels: {[key: string]: string} = {
      'cabelo': 'Cabelo',
      'unha': 'Unha',
      'sobrancelha': 'Sobrancelha',
      'depilacao': 'Depilação',
      'estetica': 'Estética',
      'tratamento': 'Tratamento'
    }
    return labels[categoria] || categoria
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <Link href="/servicos">
          <Button variant="outline" size="sm" className="w-full sm:w-auto">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Novo Serviço</h1>
          <p className="text-sm lg:text-base text-gray-600">Cadastre um novo serviço</p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base lg:text-lg">Dados do Serviço</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-6">
            {/* Nome e Categoria */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nome" className="text-sm lg:text-base">Nome *</Label>
                <Input
                  id="nome"
                  name="nome"
                  value={formData.nome}
                  onChange={handleChange}
                  required
                  placeholder="Nome do serviço"
                  className={`text-sm lg:text-base ${errors.nome ? 'border-red-500' : ''}`}
                />
                {errors.nome && (
                  <p className="text-red-500 text-xs">{errors.nome}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="categoria" className="text-sm lg:text-base">Categoria *</Label>
                <select
                  id="categoria"
                  name="categoria"
                  value={formData.categoria}
                  onChange={handleChange}
                  required
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm lg:text-base ${errors.categoria ? 'border-red-500' : ''}`}
                >
                  <option value="">Selecione uma categoria</option>
                  {CATEGORIAS_SERVICO.map(categoria => (
                    <option key={categoria} value={categoria}>
                      {getCategoriaLabel(categoria)}
                    </option>
                  ))}
                </select>
                {errors.categoria && (
                  <p className="text-red-500 text-xs">{errors.categoria}</p>
                )}
              </div>
            </div>

            {/* Duração e Preço */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duracao" className="text-sm lg:text-base">Duração (minutos) *</Label>
                <Input
                  id="duracao"
                  name="duracao"
                  value={formData.duracao}
                  onChange={handleChange}
                  required
                  placeholder="60"
                  className={`text-sm lg:text-base ${errors.duracao ? 'border-red-500' : ''}`}
                />
                {errors.duracao && (
                  <p className="text-red-500 text-xs">{errors.duracao}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="preco" className="text-sm lg:text-base">Preço (R$) *</Label>
                <Input
                  id="preco"
                  name="preco"
                  value={formData.preco}
                  onChange={handleChange}
                  required
                  placeholder="50,00"
                  className={`text-sm lg:text-base ${errors.preco ? 'border-red-500' : ''}`}
                />
                {errors.preco && (
                  <p className="text-red-500 text-xs">{errors.preco}</p>
                )}
              </div>
            </div>

            {/* Descrição */}
            <div className="space-y-2">
              <Label htmlFor="descricao" className="text-sm lg:text-base">Descrição</Label>
              <Textarea
                id="descricao"
                name="descricao"
                value={formData.descricao}
                onChange={handleChange}
                placeholder="Descrição do serviço..."
                rows={3}
                className="text-sm lg:text-base resize-none"
              />
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
                Serviço ativo (disponível para agendamento)
              </Label>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
              <Button 
                type="submit" 
                disabled={loading} 
                className="w-full sm:w-auto text-sm lg:text-base"
              >
                <Save className="h-4 w-4 mr-2" />
                {loading ? 'Salvando...' : 'Salvar Serviço'}
              </Button>
              <Link href="/servicos" className="w-full sm:w-auto">
                <Button type="button" variant="outline" className="w-full text-sm lg:text-base">
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