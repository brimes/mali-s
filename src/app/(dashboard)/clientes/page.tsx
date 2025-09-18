'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Plus, Search, Phone, Mail, Loader2 } from 'lucide-react'
import Link from 'next/link'

interface Cliente {
  id: string
  nome: string
  telefone: string
  email: string | null
  agendamentos: any[]
}

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchClientes()
  }, [])

  const fetchClientes = async () => {
    try {
      const response = await fetch('/api/clientes')
      if (!response.ok) {
        throw new Error('Erro ao buscar clientes')
      }
      const data = await response.json()
      setClientes(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  const filteredClientes = clientes.filter(cliente =>
    cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.telefone.includes(searchTerm) ||
    (cliente.email && cliente.email.toLowerCase().includes(searchTerm.toLowerCase()))
  )
  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Clientes</h1>
          <p className="text-sm lg:text-base text-gray-600">Gerencie os clientes do salão</p>
        </div>
        <Link href="/clientes/novo">
          <Button className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Novo Cliente
          </Button>
        </Link>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por nome, telefone ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Clients List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base lg:text-lg">
            Lista de Clientes 
            {!loading && (
              <span className="text-sm font-normal text-gray-500 ml-2">
                ({filteredClientes.length} {filteredClientes.length === 1 ? 'cliente' : 'clientes'})
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-48"></div>
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-32"></div>
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-24"></div>
                  </div>
                  <div className="flex gap-2">
                    <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center text-red-600 p-8">
              <p>Erro ao carregar clientes: {error}</p>
              <Button onClick={fetchClientes} className="mt-4">
                Tentar Novamente
              </Button>
            </div>
          ) : filteredClientes.length === 0 ? (
            <div className="text-center text-gray-500 p-8">
              {clientes.length === 0 ? (
                <div>
                  <p className="mb-4">Nenhum cliente cadastrado ainda.</p>
                  <Link href="/clientes/novo">
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Cadastrar Primeiro Cliente
                    </Button>
                  </Link>
                </div>
              ) : (
                <p>Nenhum cliente encontrado com os termos de busca.</p>
              )}
            </div>
          ) : (
            <div className="space-y-3 lg:space-y-4">
              {filteredClientes.map((cliente) => (
                <div
                  key={cliente.id}
                  className="flex flex-col lg:flex-row lg:items-center justify-between p-3 lg:p-4 border rounded-lg hover:bg-gray-50 gap-3 lg:gap-0"
                >
                  <div className="space-y-1 flex-1">
                    <h3 className="font-semibold text-gray-900 text-sm lg:text-base">{cliente.nome}</h3>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs lg:text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Phone className="h-3 w-3 lg:h-4 lg:w-4" />
                        <span className="break-all">{cliente.telefone}</span>
                      </div>
                      {cliente.email && (
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3 lg:h-4 lg:w-4" />
                          <span className="break-all">{cliente.email}</span>
                        </div>
                      )}
                    </div>
                    <div className="text-xs lg:text-sm text-gray-500">
                      {cliente.agendamentos.length} {cliente.agendamentos.length === 1 ? 'agendamento' : 'agendamentos'}
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
                    <Link href={`/clientes/${cliente.id}`} className="flex-1 lg:flex-none">
                      <Button variant="outline" size="sm" className="w-full lg:w-auto text-xs lg:text-sm">
                        Ver Detalhes
                      </Button>
                    </Link>
                    <Link href={`/clientes/${cliente.id}/editar`} className="flex-1 lg:flex-none">
                      <Button variant="outline" size="sm" className="w-full lg:w-auto text-xs lg:text-sm">
                        Editar
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}