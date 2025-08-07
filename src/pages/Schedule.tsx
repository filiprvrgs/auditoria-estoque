import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Calendar, CheckCircle, RefreshCw } from 'lucide-react'

// TESTE: Forçar deploy com dropdowns funcionais
export default function Schedule() {
  const [schedules, setSchedules] = useState<any[]>(() => {
    const saved = localStorage.getItem('auditSchedules')
    return saved ? JSON.parse(saved) : []
  })

  const [audits] = useState<any[]>(() => {
    const saved = localStorage.getItem('audits')
    return saved ? JSON.parse(saved) : []
  })

  const [showModal, setShowModal] = useState(false)
  const [editingSchedule, setEditingSchedule] = useState<any | null>(null)
  const [showAuditsModal, setShowAuditsModal] = useState(false)
  const [selectedSchedule, setSelectedSchedule] = useState<any | null>(null)

  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()

  // Categorias predefinidas
  const categories = [
    'Eletrônicos',
    'Móveis',
    'Roupas',
    'Alimentos',
    'Livros',
    'Ferramentas',
    'Automotivo',
    'Casa e Jardim',
    'Esportes',
    'Outros'
  ]

  // Armazéns predefinidos
  const warehouses = [
    'Armazém Central',
    'Armazém Norte',
    'Armazém Sul',
    'Armazém Leste',
    'Armazém Oeste',
    'Depósito Principal',
    'Depósito Secundário'
  ]

  // Sincronizar progresso com auditorias realizadas
  const syncProgressWithAudits = () => {
    const updatedSchedules = schedules.map(schedule => {
      // Filtrar auditorias da classe para o mês atual
      const classAudits = audits.filter(audit => {
        const auditDate = new Date(audit.auditDate)
        const isCurrentMonth = auditDate.getMonth() === currentMonth && auditDate.getFullYear() === currentYear
        
        const matchesClass = audit.items.some((item: any) => {
          const productCodeMatch = item.productCode && item.productCode.includes(schedule.classCode)
          const productNameMatch = item.productName && item.productName.includes(schedule.classCode)
          const classNameMatch = item.productName && schedule.className && item.productName.includes(schedule.className)
          return productCodeMatch || productNameMatch || classNameMatch
        })
        
        return isCurrentMonth && matchesClass
      })

      const completedThisMonth = classAudits.length
      
      // Atualizar status baseado no progresso
      let status: 'pending' | 'in-progress' | 'completed' | 'overdue' = 'pending'
      if (completedThisMonth > 0) {
        if (completedThisMonth >= schedule.monthlyTarget) {
          status = 'completed'
        } else {
          status = 'in-progress'
        }
      }

      return {
        ...schedule,
        completedThisMonth,
        status
      }
    })

    setSchedules(updatedSchedules)
    localStorage.setItem('auditSchedules', JSON.stringify(updatedSchedules))
  }

  useEffect(() => {
    syncProgressWithAudits()
  }, [audits, schedules.length])

  const addSchedule = () => {
    const newSchedule = {
      id: Date.now().toString(),
      className: '',
      classCode: '',
      description: '',
      category: '',
      warehouse: '',
      frequencyPerYear: 12,
      monthlyTarget: 1,
      completedThisMonth: 0,
      status: 'pending'
    }
    setEditingSchedule(newSchedule)
    setShowModal(true)
  }

  const editSchedule = (schedule: any) => {
    setEditingSchedule(schedule)
    setShowModal(true)
  }

  const deleteSchedule = (id: string) => {
    setSchedules(schedules.filter(s => s.id !== id))
  }

  const saveSchedule = () => {
    if (!editingSchedule) return

    if (editingSchedule.id) {
      setSchedules(schedules.map(s => s.id === editingSchedule.id ? editingSchedule : s))
    } else {
      setSchedules([...schedules, { ...editingSchedule, id: Date.now().toString() }])
    }

    setShowModal(false)
    setEditingSchedule(null)
  }

  const updateStatus = (id: string, status: 'pending' | 'in-progress' | 'completed' | 'overdue') => {
    setSchedules(schedules.map(s => s.id === id ? { ...s, status } : s))
  }

  const updateProgress = (id: string, completedThisMonth: number) => {
    setSchedules(schedules.map(s => s.id === id ? { ...s, completedThisMonth } : s))
  }

  const getRelatedAudits = (schedule: any) => {
    return audits.filter(audit => {
      const auditDate = new Date(audit.auditDate)
      const isCurrentMonth = auditDate.getMonth() === currentMonth && auditDate.getFullYear() === currentYear
      
      const matchesClass = audit.items.some((item: any) => {
        const productCodeMatch = item.productCode && item.productCode.includes(schedule.classCode)
        const productNameMatch = item.productName && item.productName.includes(schedule.classCode)
        const classNameMatch = item.productName && schedule.className && item.productName.includes(schedule.className)
        return productCodeMatch || productNameMatch || classNameMatch
      })
      
      return isCurrentMonth && matchesClass
    })
  }

  const viewRelatedAudits = (schedule: any) => {
    setSelectedSchedule(schedule)
    setShowAuditsModal(true)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'in-progress': return 'bg-blue-100 text-blue-800'
      case 'overdue': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const totalSchedules = schedules.length
  const completedSchedules = schedules.filter(s => s.status === 'completed').length
  const inProgressSchedules = schedules.filter(s => s.status === 'in-progress').length
  const pendingSchedules = schedules.filter(s => s.status === 'pending').length

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Cronograma de Auditorias</h1>
          <p className="text-gray-600">Gerencie o cronograma de auditorias por classe</p>
        </div>

        {/* Botões de Ação */}
        <div className="flex flex-wrap gap-4 mb-6">
          <button
            onClick={addSchedule}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} />
            Adicionar Classe
          </button>
          
          <button
            onClick={syncProgressWithAudits}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            <RefreshCw size={20} />
            Sincronizar
          </button>
        </div>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total de Classes</p>
                <p className="text-2xl font-bold text-gray-900">{totalSchedules}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Concluídas</p>
                <p className="text-2xl font-bold text-green-600">{completedSchedules}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <div className="h-6 w-6 bg-blue-600 rounded-full"></div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Em Andamento</p>
                <p className="text-2xl font-bold text-blue-600">{inProgressSchedules}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-gray-100 rounded-lg">
                <div className="h-6 w-6 bg-gray-600 rounded-full"></div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pendentes</p>
                <p className="text-2xl font-bold text-gray-600">{pendingSchedules}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de Cronogramas */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Cronograma de Classes</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Classe</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoria</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Meta Mensal</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Concluídas</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {schedules.map((schedule) => (
                  <tr key={schedule.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{schedule.className}</div>
                        <div className="text-sm text-gray-500">{schedule.description}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{schedule.classCode}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{schedule.category}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="number"
                        value={schedule.monthlyTarget}
                        onChange={(e) => {
                          const newSchedule = { ...schedule, monthlyTarget: parseInt(e.target.value) || 0 }
                          setSchedules(schedules.map(s => s.id === schedule.id ? newSchedule : s))
                        }}
                        className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                        min="0"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="number"
                        value={schedule.completedThisMonth}
                        onChange={(e) => updateProgress(schedule.id, parseInt(e.target.value) || 0)}
                        className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                        min="0"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={schedule.status}
                        onChange={(e) => updateStatus(schedule.id, e.target.value as any)}
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(schedule.status)}`}
                      >
                        <option value="pending">Pendente</option>
                        <option value="in-progress">Em Andamento</option>
                        <option value="completed">Concluído</option>
                        <option value="overdue">Atrasado</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => editSchedule(schedule)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => deleteSchedule(schedule.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 size={16} />
                        </button>
                        <button
                          onClick={() => viewRelatedAudits(schedule)}
                          className="text-green-600 hover:text-green-900"
                        >
                          <CheckCircle size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal para Adicionar/Editar */}
        {showModal && editingSchedule && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {editingSchedule.id ? 'Editar Classe' : 'Adicionar Classe'}
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nome da Classe</label>
                    <input
                      type="text"
                      value={editingSchedule.className}
                      onChange={(e) => setEditingSchedule({...editingSchedule, className: e.target.value})}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ex: Eletrônicos Básicos"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Código da Classe</label>
                    <input
                      type="text"
                      value={editingSchedule.classCode}
                      onChange={(e) => setEditingSchedule({...editingSchedule, classCode: e.target.value})}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ex: ELET001"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Descrição</label>
                    <input
                      type="text"
                      value={editingSchedule.description}
                      onChange={(e) => setEditingSchedule({...editingSchedule, description: e.target.value})}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Descrição detalhada da classe"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Categoria</label>
                    <select
                      value={editingSchedule.category}
                      onChange={(e) => setEditingSchedule({...editingSchedule, category: e.target.value})}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Selecione uma categoria</option>
                      {categories.map((category) => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Armazém</label>
                    <select
                      value={editingSchedule.warehouse}
                      onChange={(e) => setEditingSchedule({...editingSchedule, warehouse: e.target.value})}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Selecione um armazém</option>
                      {warehouses.map((warehouse) => (
                        <option key={warehouse} value={warehouse}>{warehouse}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Frequência por Ano</label>
                    <input
                      type="number"
                      value={editingSchedule.frequencyPerYear}
                      onChange={(e) => setEditingSchedule({...editingSchedule, frequencyPerYear: parseInt(e.target.value) || 0})}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      min="1"
                      max="52"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={saveSchedule}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
                  >
                    Salvar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Auditorias Relacionadas */}
        {showAuditsModal && selectedSchedule && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-3/4 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Auditorias Relacionadas - {selectedSchedule.className}
                </h3>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Auditor</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Local</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Itens</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {getRelatedAudits(selectedSchedule).map((audit) => (
                        <tr key={audit.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(audit.auditDate).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{audit.auditor}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{audit.location}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{audit.items.length}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <div className="flex justify-end mt-6">
                  <button
                    onClick={() => setShowAuditsModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
