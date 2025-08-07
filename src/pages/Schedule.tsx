import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Save, X, CheckCircle, Clock, AlertTriangle } from 'lucide-react'

interface AuditSchedule {
  id: string
  className: string
  classCode: string
  description: string
  category: string
  warehouse: string
  frequencyPerYear: number
  monthlyTarget: number
  completedThisMonth: number
  lastAuditDate?: string
  nextAuditDate?: string
  status: 'pending' | 'in-progress' | 'completed' | 'overdue'
  notes?: string
}

export default function Schedule() {
  const [schedules, setSchedules] = useState<AuditSchedule[]>([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedSchedule, setSelectedSchedule] = useState<AuditSchedule | null>(null)
  const [currentMonth] = useState(new Date().getMonth())
  const [currentYear] = useState(new Date().getFullYear())

  // Estados para o formulário
  const [formData, setFormData] = useState({
    className: '',
    classCode: '',
    description: '',
    category: '',
    warehouse: '',
    frequencyPerYear: 12,
    monthlyTarget: 1,
    notes: ''
  })

  useEffect(() => {
    const savedSchedules = JSON.parse(localStorage.getItem('auditSchedules') || '[]')
    setSchedules(savedSchedules)
  }, [])

  const saveSchedules = (newSchedules: AuditSchedule[]) => {
    setSchedules(newSchedules)
    localStorage.setItem('auditSchedules', JSON.stringify(newSchedules))
  }

  const addSchedule = () => {
    const newSchedule: AuditSchedule = {
      id: Date.now().toString(),
      ...formData,
      completedThisMonth: 0,
      status: 'pending',
      nextAuditDate: new Date().toISOString().split('T')[0]
    }

    const updatedSchedules = [...schedules, newSchedule]
    saveSchedules(updatedSchedules)
    setShowAddModal(false)
    resetForm()
  }

  const updateSchedule = () => {
    if (!selectedSchedule) return

    const updatedSchedules = schedules.map(schedule =>
      schedule.id === selectedSchedule.id
        ? { ...schedule, ...formData }
        : schedule
    )

    saveSchedules(updatedSchedules)
    setShowEditModal(false)
    setSelectedSchedule(null)
    resetForm()
  }

  const deleteSchedule = (id: string) => {
    const updatedSchedules = schedules.filter(schedule => schedule.id !== id)
    saveSchedules(updatedSchedules)
  }

  const resetForm = () => {
    setFormData({
      className: '',
      classCode: '',
      description: '',
      category: '',
      warehouse: '',
      frequencyPerYear: 12,
      monthlyTarget: 1,
      notes: ''
    })
  }

  const editSchedule = (schedule: AuditSchedule) => {
    setSelectedSchedule(schedule)
    setFormData({
      className: schedule.className,
      classCode: schedule.classCode,
      description: schedule.description,
      category: schedule.category,
      warehouse: schedule.warehouse,
      frequencyPerYear: schedule.frequencyPerYear,
      monthlyTarget: schedule.monthlyTarget,
      notes: schedule.notes || ''
    })
    setShowEditModal(true)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-success-100 text-success-800'
      case 'in-progress': return 'bg-warning-100 text-warning-800'
      case 'overdue': return 'bg-danger-100 text-danger-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />
      case 'in-progress': return <Clock className="h-4 w-4" />
      case 'overdue': return <AlertTriangle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Motor': 'bg-blue-100 text-blue-800',
      'Rele': 'bg-green-100 text-green-800',
      'Suspensão': 'bg-purple-100 text-purple-800',
      'Parafuso de roda': 'bg-orange-100 text-orange-800',
      'Estamparia': 'bg-red-100 text-red-800',
      'Conformação': 'bg-indigo-100 text-indigo-800',
      'Traub': 'bg-pink-100 text-pink-800',
      'Injetora': 'bg-yellow-100 text-yellow-800',
      'Almox. Geral': 'bg-gray-100 text-gray-800'
    }
    return colors[category] || 'bg-gray-100 text-gray-800'
  }

  const getMonthlyProgress = () => {
    const totalTarget = schedules.reduce((sum, schedule) => sum + schedule.monthlyTarget, 0)
    const totalCompleted = schedules.reduce((sum, schedule) => sum + schedule.completedThisMonth, 0)
    return totalTarget > 0 ? Math.round((totalCompleted / totalTarget) * 100) : 0
  }

  const getMonthlyStats = () => {
    const totalTarget = schedules.reduce((sum, schedule) => sum + schedule.monthlyTarget, 0)
    const totalCompleted = schedules.reduce((sum, schedule) => sum + schedule.completedThisMonth, 0)
    const completedSchedules = schedules.filter(schedule => schedule.status === 'completed').length
    const inProgressSchedules = schedules.filter(schedule => schedule.status === 'in-progress').length
    const pendingSchedules = schedules.filter(schedule => schedule.status === 'pending').length

    return {
      totalTarget,
      totalCompleted,
      completedSchedules,
      inProgressSchedules,
      pendingSchedules
    }
  }

  const stats = getMonthlyStats()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Cronograma de Auditorias
            </h2>
            <p className="text-gray-600">
              Gerencie o cronograma de auditorias por classe e categoria
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Adicionar Classe</span>
          </button>
        </div>
      </div>

      {/* Monthly Progress */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Progresso do Mês - {new Date(currentYear, currentMonth).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{stats.totalTarget}</p>
            <p className="text-sm text-gray-500">Meta Mensal</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{stats.totalCompleted}</p>
            <p className="text-sm text-gray-500">Concluídas</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">{getMonthlyProgress()}%</p>
            <p className="text-sm text-gray-500">Progresso</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-orange-600">{stats.pendingSchedules}</p>
            <p className="text-sm text-gray-500">Pendentes</p>
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${getMonthlyProgress()}%` }}
          ></div>
        </div>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-success-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Concluídas</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.completedSchedules}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-warning-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Em Progresso</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.inProgressSchedules}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <AlertTriangle className="h-8 w-8 text-danger-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Pendentes</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.pendingSchedules}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Schedules Table */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Cronograma de Auditorias
        </h3>
        
        {/* Desktop Table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Classe
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Descrição
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categoria
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Galpão
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Frequência/Ano
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Meta Mensal
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Progresso
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {schedules.map((schedule) => (
                <tr key={schedule.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{schedule.classCode}</p>
                      <p className="text-xs text-gray-500">{schedule.className}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="text-sm text-gray-900">{schedule.description}</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(schedule.category)}`}>
                      {schedule.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {schedule.warehouse}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {schedule.frequencyPerYear}x/ano
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {schedule.monthlyTarget}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${schedule.monthlyTarget > 0 ? (schedule.completedThisMonth / schedule.monthlyTarget) * 100 : 0}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500">
                        {schedule.completedThisMonth}/{schedule.monthlyTarget}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(schedule.status)}`}>
                      {getStatusIcon(schedule.status)}
                      <span className="ml-1">
                        {schedule.status === 'completed' ? 'Concluída' :
                         schedule.status === 'in-progress' ? 'Em Progresso' :
                         schedule.status === 'overdue' ? 'Atrasada' : 'Pendente'}
                      </span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => editSchedule(schedule)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Editar"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteSchedule(schedule.id)}
                        className="text-danger-600 hover:text-danger-900"
                        title="Excluir"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="lg:hidden space-y-4">
          {schedules.map((schedule) => (
            <div key={schedule.id} className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-gray-900">{schedule.classCode} - {schedule.className}</h4>
                  <p className="text-sm text-gray-500">{schedule.description}</p>
                  <div className="flex items-center space-x-2 mt-2">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(schedule.category)}`}>
                      {schedule.category}
                    </span>
                    <span className="text-xs text-gray-500">{schedule.warehouse}</span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => editSchedule(schedule)}
                    className="text-blue-600 hover:text-blue-900 p-1 rounded"
                    title="Editar"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => deleteSchedule(schedule.id)}
                    className="text-danger-600 hover:text-danger-900 p-1 rounded"
                    title="Excluir"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                <div>
                  <span className="text-gray-500">Frequência:</span>
                  <span className="ml-1 font-medium">{schedule.frequencyPerYear}x/ano</span>
                </div>
                <div>
                  <span className="text-gray-500">Meta:</span>
                  <span className="ml-1 font-medium">{schedule.monthlyTarget}</span>
                </div>
                <div>
                  <span className="text-gray-500">Progresso:</span>
                  <span className="ml-1 font-medium">{schedule.completedThisMonth}/{schedule.monthlyTarget}</span>
                </div>
                <div>
                  <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(schedule.status)}`}>
                    {getStatusIcon(schedule.status)}
                    <span className="ml-1">
                      {schedule.status === 'completed' ? 'Concluída' :
                       schedule.status === 'in-progress' ? 'Em Progresso' :
                       schedule.status === 'overdue' ? 'Atrasada' : 'Pendente'}
                    </span>
                  </span>
                </div>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${schedule.monthlyTarget > 0 ? (schedule.completedThisMonth / schedule.monthlyTarget) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {showAddModal ? 'Adicionar Classe' : 'Editar Classe'}
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false)
                  setShowEditModal(false)
                  resetForm()
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Código da Classe
                </label>
                <input
                  type="text"
                  value={formData.classCode}
                  onChange={(e) => setFormData({...formData, classCode: e.target.value})}
                  className="input-field"
                  placeholder="Ex: 8701^8795"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome da Classe
                </label>
                <input
                  type="text"
                  value={formData.className}
                  onChange={(e) => setFormData({...formData, className: e.target.value})}
                  className="input-field"
                  placeholder="Ex: Motor"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="input-field"
                  placeholder="Ex: Impulsores, Bobinas, Chavetas"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoria
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="input-field"
                >
                  <option value="">Selecione uma categoria</option>
                  <option value="Motor">Motor</option>
                  <option value="Rele">Rele</option>
                  <option value="Suspensão">Suspensão</option>
                  <option value="Parafuso de roda">Parafuso de roda</option>
                  <option value="Estamparia">Estamparia</option>
                  <option value="Conformação">Conformação</option>
                  <option value="Traub">Traub</option>
                  <option value="Injetora">Injetora</option>
                  <option value="Almox. Geral">Almox. Geral</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Galpão
                </label>
                <input
                  type="text"
                  value={formData.warehouse}
                  onChange={(e) => setFormData({...formData, warehouse: e.target.value})}
                  className="input-field"
                  placeholder="Ex: Galpão 02"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Frequência por Ano
                  </label>
                  <input
                    type="number"
                    value={formData.frequencyPerYear}
                    onChange={(e) => setFormData({...formData, frequencyPerYear: parseInt(e.target.value) || 0})}
                    className="input-field"
                    min="1"
                    max="52"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meta Mensal
                  </label>
                  <input
                    type="number"
                    value={formData.monthlyTarget}
                    onChange={(e) => setFormData({...formData, monthlyTarget: parseInt(e.target.value) || 0})}
                    className="input-field"
                    min="1"
                    max="31"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Observações
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  className="input-field"
                  rows={3}
                  placeholder="Observações adicionais..."
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false)
                    setShowEditModal(false)
                    resetForm()
                  }}
                  className="btn-secondary"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={showAddModal ? addSchedule : updateSchedule}
                  className="btn-primary"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {showAddModal ? 'Adicionar' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
