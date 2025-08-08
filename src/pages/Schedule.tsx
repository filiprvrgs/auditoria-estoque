import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Calendar, CheckCircle, Clock, Target } from 'lucide-react'

export default function Schedule() {
  const [schedules, setSchedules] = useState<any[]>([])
  const [selectedMonth, setSelectedMonth] = useState(() => new Date().getMonth())
  const [selectedYear, setSelectedYear] = useState(() => new Date().getFullYear())

  // Carregar dados do localStorage
  useEffect(() => {
    const saved = localStorage.getItem('auditSchedules')
    if (saved) {
      try {
        const parsedSchedules = JSON.parse(saved)
        setSchedules(parsedSchedules)
      } catch (error) {
        console.error('Erro ao carregar cronogramas:', error)
        localStorage.removeItem('auditSchedules')
      }
    }
  }, [])

  // Carregar auditorias e atualizar quando houver mudanças
  const [audits, setAudits] = useState<any[]>(() => {
    const saved = localStorage.getItem('audits')
    return saved ? JSON.parse(saved) : []
  })

  // Atualizar auditorias quando o localStorage mudar
  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem('audits')
      if (saved) {
        setAudits(JSON.parse(saved))
      }
    }

    // Adicionar listener para mudanças no localStorage
    window.addEventListener('storage', handleStorageChange)
    
    // Verificar mudanças a cada 5 segundos
    const interval = setInterval(() => {
      const saved = localStorage.getItem('audits')
      if (saved) {
        const parsedAudits = JSON.parse(saved)
        setAudits(prev => {
          // Só atualiza se houver mudança
          if (JSON.stringify(prev) !== JSON.stringify(parsedAudits)) {
            return parsedAudits
          }
          return prev
        })
      }
    }, 5000)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      clearInterval(interval)
    }
  }, [])

  const [showModal, setShowModal] = useState(false)
  const [editingSchedule, setEditingSchedule] = useState<any | null>(null)
  const [showAuditsModal, setShowAuditsModal] = useState(false)
  const [selectedSchedule, setSelectedSchedule] = useState<any | null>(null)

  // Categorias do sistema
  const categories = [
    'Motor',
    'Relé',
    'Suspensão',
    'Parafuso de roda',
    'Estamparia',
    'Conformação',
    'Traub',
    'Injetora',
    'ALMOX. GERAL'
  ]

  // Galpões do sistema
  const warehouses = [
    'Galpão 01',
    'Galpão 02',
    'Galpão 03',
    'Galpão 04',
    'Galpão 05'
  ]

  // Meses do ano
  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ]

  // Sincronizar progresso com auditorias realizadas
  const syncProgressWithAudits = () => {
    if (schedules.length === 0) return // Não executar se não houver cronogramas

    const updatedSchedules = schedules.map(schedule => {
      // Buscar TODAS as auditorias da classe (não filtrar por mês)
      const allClassAudits = audits.filter(audit => {
        // Verificar se a auditoria é do tipo 'classe' e corresponde ao código da classe
        const matchesClass = audit.entryType === 'classe' && 
          audit.items.some((item: any) => {
            // Verificar correspondência exata do código ou se o código está contido no item
            const exactMatch = item.productCode === schedule.classCode
            const containsMatch = item.productCode && item.productCode.includes(schedule.classCode)
            const nameMatch = item.productName && item.productName.includes(schedule.classCode)
            
            // Debug: logar tentativas de correspondência
            if (audit.entryType === 'classe') {
              console.log(`Verificando classe ${schedule.classCode}:`, {
                itemProductCode: item.productCode,
                itemProductName: item.productName,
                exactMatch,
                containsMatch,
                nameMatch,
                finalMatch: exactMatch || containsMatch || nameMatch
              })
            }
            
            return exactMatch || containsMatch || nameMatch
          })
        
        return matchesClass
      })

      // Debug: logar resultado para esta classe
      console.log(`Classe ${schedule.className} (${schedule.classCode}):`, {
        totalAudits: audits.length,
        classAudits: allClassAudits.length,
        isCompleted: allClassAudits.length > 0
      })

      // Status baseado em TODAS as auditorias (não só do mês)
      const isCompleted = allClassAudits.length > 0
      const lastAuditDate = allClassAudits.length > 0 
        ? new Date(Math.max(...allClassAudits.map(a => new Date(a.date).getTime())))
        : null

      // Status automático baseado no envio para dashboard
      let status: 'pending' | 'completed' = isCompleted ? 'completed' : 'pending'

      return {
        ...schedule,
        isCompleted,
        lastAuditDate,
        status
      }
    })

    // Sempre atualizar para garantir sincronização
    setSchedules(updatedSchedules)
    localStorage.setItem('auditSchedules', JSON.stringify(updatedSchedules))
    
    console.log('Sincronização executada:', {
      totalSchedules: updatedSchedules.length,
      completedSchedules: updatedSchedules.filter(s => s.status === 'completed').length,
      auditoriasTipoClasse: audits.filter(a => a.entryType === 'classe').length
    })
  }

  // Atualizar automaticamente quando houver novas auditorias
  useEffect(() => {
    if (schedules.length > 0) {
      syncProgressWithAudits()
    }
  }, [audits])

  // Atualizar quando mudar mês/ano
  useEffect(() => {
    if (schedules.length > 0) {
      syncProgressWithAudits()
    }
  }, [selectedMonth, selectedYear])

  const addSchedule = () => {
    setEditingSchedule({
      id: '',
      className: '',
      classCode: '',
      description: '',
      category: '',
      warehouse: '',
      status: 'pending',
      isCompleted: false,
      lastAuditDate: null,
      month: selectedMonth,
      year: selectedYear
    })
    setShowModal(true)
  }

  const editSchedule = (schedule: any) => {
    setEditingSchedule(schedule)
    setShowModal(true)
  }

  const deleteSchedule = (id: string) => {
    const updatedSchedules = schedules.filter(s => s.id !== id)
    setSchedules(updatedSchedules)
    localStorage.setItem('auditSchedules', JSON.stringify(updatedSchedules))
  }

  const saveSchedule = () => {
    if (!editingSchedule.className || !editingSchedule.classCode) {
      alert('Por favor, preencha o nome e código da classe.')
      return
    }

    let updatedSchedules
    if (editingSchedule.id) {
      // Editar
      updatedSchedules = schedules.map(s => 
        s.id === editingSchedule.id ? editingSchedule : s
      )
    } else {
      // Adicionar novo
      const newSchedule = {
        ...editingSchedule,
        id: Date.now().toString()
      }
      updatedSchedules = [...schedules, newSchedule]
    }

    setSchedules(updatedSchedules)
    localStorage.setItem('auditSchedules', JSON.stringify(updatedSchedules))
    setShowModal(false)
    setEditingSchedule(null)
  }

  const getRelatedAudits = (schedule: any) => {
    // Sempre filtrar pelo mês selecionado, independente do que está salvo
    return audits.filter(audit => {
      const auditDate = new Date(audit.date)
      const isSelectedMonth = auditDate.getMonth() === selectedMonth && 
                            auditDate.getFullYear() === selectedYear
      
      // Verificar se a auditoria é do tipo 'classe' e corresponde ao código da classe
      const matchesClass = audit.entryType === 'classe' && 
        audit.items.some((item: any) => {
          // Verificar correspondência exata do código ou se o código está contido no item
          const exactMatch = item.productCode === schedule.classCode
          const containsMatch = item.productCode && item.productCode.includes(schedule.classCode)
          const nameMatch = item.productName && item.productName.includes(schedule.classCode)
          
          return exactMatch || containsMatch || nameMatch
        })
      
      return isSelectedMonth && matchesClass
    })
  }

  const viewRelatedAudits = (schedule: any) => {
    setSelectedSchedule(schedule)
    setShowAuditsModal(true)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Filtrar classes do mês selecionado
  const filteredSchedules = schedules.filter(schedule => {
    // Mostrar classes do mês selecionado OU classes que foram auditadas no mês selecionado
    const isFromSelectedMonth = schedule.month === selectedMonth && schedule.year === selectedYear
    
    // Verificar se há auditorias desta classe no mês selecionado
    const hasAuditsInSelectedMonth = audits.some(audit => {
      const auditDate = new Date(audit.date)
      const isSelectedMonth = auditDate.getMonth() === selectedMonth && 
                           auditDate.getFullYear() === selectedYear
      
      return isSelectedMonth && audit.entryType === 'classe' && 
        audit.items.some((item: any) => {
          const exactMatch = item.productCode === schedule.classCode
          const containsMatch = item.productCode && item.productCode.includes(schedule.classCode)
          const nameMatch = item.productName && item.productName.includes(schedule.classCode)
          return exactMatch || containsMatch || nameMatch
        })
    })
    
    return isFromSelectedMonth || hasAuditsInSelectedMonth
  })

  const totalSchedules = filteredSchedules.length
  const completedSchedules = filteredSchedules.filter(s => s.status === 'completed').length
  const pendingSchedules = filteredSchedules.filter(s => s.status === 'pending').length
  const completionRate = totalSchedules > 0 
    ? Math.round((completedSchedules / totalSchedules) * 100) 
    : 0

  // Sistema Auditoria Plus - Identificar auditorias com baixa precisão
  const getLowPrecisionAudits = () => {
    return audits.filter(audit => {
      // Filtrar apenas auditorias de classe dos últimos 3 meses
      const auditDate = new Date(audit.date)
      const threeMonthsAgo = new Date()
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)
      
      const isRecent = auditDate >= threeMonthsAgo
      const isClassAudit = audit.entryType === 'classe' || audit.entryType === undefined
      
      // Debug: logar estrutura da auditoria
      console.log('Analisando auditoria:', {
        id: audit.id,
        date: audit.date,
        entryType: audit.entryType,
        items: audit.items,
        precision: audit.precision,
        itemsDetails: audit.items?.map((item: any) => ({
          productCode: item.productCode,
          productName: item.productName,
          status: item.status,
          quantity: item.quantity,
          allKeys: Object.keys(item)
        }))
      })
      
      // Calcular precisão da auditoria usando a mesma fórmula do Dashboard
      let precision = 100
      
      if (audit.items && audit.items.length > 0) {
        const totalExpected = audit.items.reduce((sum: number, item: any) => sum + (item.expectedQuantity || 0), 0)
        const totalActual = audit.items.reduce((sum: number, item: any) => sum + (item.actualQuantity || 0), 0)
        precision = totalExpected > 0 ? ((totalExpected - Math.abs(totalExpected - totalActual)) / totalExpected) * 100 : 0
      }
      
      // Debug: logar precisão calculada
      console.log('Precisão calculada:', precision)
      
      // Considerar baixa precisão se < 80%
      const isLowPrecision = precision < 80
      
      console.log('É baixa precisão?', isLowPrecision)
      
      return isRecent && isClassAudit && isLowPrecision
    })
  }

  // Gerar sugestões de auditoria plus
  const generateAuditPlusSuggestions = () => {
    const lowPrecisionAudits = getLowPrecisionAudits()
    
    return lowPrecisionAudits.map(audit => {
      // Encontrar a classe correspondente
      const relatedClass = schedules.find(schedule => 
        audit.items.some((item: any) => {
          const exactMatch = item.productCode === schedule.classCode
          const containsMatch = item.productCode && item.productCode.includes(schedule.classCode)
          const nameMatch = item.productName && item.productName.includes(schedule.classCode)
          return exactMatch || containsMatch || nameMatch
        })
      )

      // Calcular precisão usando a mesma fórmula do Dashboard
      let precision = 100
      
      if (audit.items && audit.items.length > 0) {
        const totalExpected = audit.items.reduce((sum: number, item: any) => sum + (item.expectedQuantity || 0), 0)
        const totalActual = audit.items.reduce((sum: number, item: any) => sum + (item.actualQuantity || 0), 0)
        precision = totalExpected > 0 ? ((totalExpected - Math.abs(totalExpected - totalActual)) / totalExpected) * 100 : 0
      }

      return {
        id: `plus_${audit.id}`,
        originalAuditId: audit.id,
        className: relatedClass?.className || 'Classe não identificada',
        classCode: relatedClass?.classCode || 'Código não identificado',
        category: relatedClass?.category || 'Categoria não identificada',
        warehouse: relatedClass?.warehouse || 'Galpão não identificado',
        originalDate: audit.date,
        originalPrecision: precision,
        suggestedDate: new Date().toISOString().split('T')[0], // Data atual
        priority: precision < 60 ? 'Alta' : precision < 80 ? 'Média' : 'Baixa',
        reason: `Precisão original: ${precision}% - Necessita reauditoria`
      }
    })
  }

  const auditPlusSuggestions = generateAuditPlusSuggestions()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Cronograma Mensal de Auditorias</h1>
          <p className="text-gray-600">Acompanhamento das auditorias enviadas para o dashboard</p>
        </div>

        {/* Seletor de Mês */}
        <div className="mb-6 flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              {months.map((month, index) => (
                <option key={month} value={index}>{month}</option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              {[selectedYear - 1, selectedYear, selectedYear + 1].map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          <button
            onClick={addSchedule}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} />
            Adicionar Classe
          </button>
          
          <div className="text-sm text-gray-600 bg-blue-50 px-4 py-2 rounded-lg">
            <span className="font-medium">Sincronização Automática:</span> O status das classes é atualizado automaticamente quando você salva uma auditoria.
          </div>

          <button
            onClick={() => {
              console.log('=== FORÇANDO SINCRONIZAÇÃO ===')
              console.log('Auditorias disponíveis:', audits)
              console.log('Cronogramas:', schedules)
              syncProgressWithAudits()
            }}
            className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
          >
            <CheckCircle size={20} />
            Forçar Sincronização
          </button>

          <button
            onClick={() => {
              console.log('=== DEBUG AUDITORIA PLUS ===')
              console.log('Todas as auditorias:', audits)
              console.log('Auditorias tipo classe:', audits.filter(a => a.entryType === 'classe'))
              console.log('Sugestões geradas:', auditPlusSuggestions)
              console.log('Auditorias com baixa precisão:', getLowPrecisionAudits())
            }}
            className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Target size={20} />
            Debug Auditoria Plus
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
              <div className="p-2 bg-gray-100 rounded-lg">
                <Clock className="h-6 w-6 text-gray-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pendentes</p>
                <p className="text-2xl font-bold text-gray-600">{pendingSchedules}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <div className="h-6 w-6 flex items-center justify-center text-blue-600 font-bold">%</div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Taxa de Conclusão</p>
                <p className="text-2xl font-bold text-blue-600">{completionRate}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Auditoria Plus - Sugestões de Reauditoria */}
        {auditPlusSuggestions.length > 0 && (
          <div className="bg-white rounded-lg shadow mb-8">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Target className="h-6 w-6 text-orange-600" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Auditoria Plus - Sugestões de Reauditoria
                  </h2>
                </div>
                <span className="text-sm text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
                  {auditPlusSuggestions.length} sugestão{auditPlusSuggestions.length > 1 ? 'ões' : ''}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Classes que precisam de reauditoria devido à baixa precisão anterior
              </p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-orange-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-orange-700 uppercase tracking-wider">Classe</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-orange-700 uppercase tracking-wider">Código</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-orange-700 uppercase tracking-wider">Precisão Original</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-orange-700 uppercase tracking-wider">Data Original</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-orange-700 uppercase tracking-wider">Prioridade</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-orange-700 uppercase tracking-wider">Motivo</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-orange-700 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {auditPlusSuggestions.map((suggestion) => (
                    <tr key={suggestion.id} className="bg-orange-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{suggestion.className}</div>
                          <div className="text-sm text-gray-500">{suggestion.category} - {suggestion.warehouse}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{suggestion.classCode}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          suggestion.originalPrecision < 60 ? 'bg-red-100 text-red-800' :
                          suggestion.originalPrecision < 80 ? 'bg-orange-100 text-orange-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {suggestion.originalPrecision}%
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(suggestion.originalDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          suggestion.priority === 'Alta' ? 'bg-red-100 text-red-800' :
                          suggestion.priority === 'Média' ? 'bg-orange-100 text-orange-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {suggestion.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {suggestion.reason}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              // Adicionar ao cronograma do mês atual
                              const newSchedule = {
                                id: `plus_${Date.now()}`,
                                className: suggestion.className,
                                classCode: suggestion.classCode,
                                description: `Reauditoria Plus - ${suggestion.reason}`,
                                category: suggestion.category,
                                warehouse: suggestion.warehouse,
                                status: 'pending',
                                isCompleted: false,
                                lastAuditDate: null,
                                month: selectedMonth,
                                year: selectedYear,
                                isAuditPlus: true,
                                originalAuditId: suggestion.originalAuditId
                              }
                              setSchedules(prev => [...prev, newSchedule])
                              localStorage.setItem('auditSchedules', JSON.stringify([...schedules, newSchedule]))
                              alert('Classe adicionada ao cronograma do mês atual!')
                            }}
                            className="text-green-600 hover:text-green-900"
                            title="Adicionar ao cronograma"
                          >
                            <Plus size={16} />
                          </button>
                          <button
                            onClick={() => {
                              console.log('Detalhes da auditoria original:', suggestion)
                            }}
                            className="text-blue-600 hover:text-blue-900"
                            title="Ver detalhes"
                          >
                            <Edit size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Lista de Classes */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Classes para {months[selectedMonth]} de {selectedYear}
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Classe</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoria</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Galpão</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Última Auditoria</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {schedules
                  .filter(schedule => {
                    // Mostrar classes do mês selecionado OU classes que foram auditadas no mês selecionado
                    const isFromSelectedMonth = schedule.month === selectedMonth && schedule.year === selectedYear
                    
                    // Verificar se há auditorias desta classe no mês selecionado
                    const hasAuditsInSelectedMonth = audits.some(audit => {
                      const auditDate = new Date(audit.date)
                      const isSelectedMonth = auditDate.getMonth() === selectedMonth && 
                                           auditDate.getFullYear() === selectedYear
                      
                      return isSelectedMonth && audit.entryType === 'classe' && 
                        audit.items.some((item: any) => {
                          const exactMatch = item.productCode === schedule.classCode
                          const containsMatch = item.productCode && item.productCode.includes(schedule.classCode)
                          const nameMatch = item.productName && item.productName.includes(schedule.classCode)
                          return exactMatch || containsMatch || nameMatch
                        })
                    })
                    
                    return isFromSelectedMonth || hasAuditsInSelectedMonth
                  })
                  .map((schedule) => (
                  <tr key={schedule.id} className={schedule.isCompleted ? 'bg-green-50' : ''}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{schedule.className}</div>
                        <div className="text-sm text-gray-500">{schedule.description}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{schedule.classCode}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{schedule.category}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{schedule.warehouse}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(schedule.status)}`}>
                        {schedule.status === 'completed' ? 'Concluída' : 'Pendente'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {schedule.lastAuditDate 
                        ? new Date(schedule.lastAuditDate).toLocaleDateString() 
                        : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => editSchedule(schedule)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Editar classe"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => deleteSchedule(schedule.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Excluir classe"
                        >
                          <Trash2 size={16} />
                        </button>
                        <button
                          onClick={() => viewRelatedAudits(schedule)}
                          className="text-green-600 hover:text-green-900"
                          title="Ver auditorias relacionadas"
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
                </div>
                
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => {
                      setShowModal(false)
                      setEditingSchedule(null)
                    }}
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

        {/* Modal para Visualizar Auditorias Relacionadas */}
        {showAuditsModal && selectedSchedule && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-4/5 max-w-4xl shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Auditorias da Classe - {selectedSchedule.className}
                </h3>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Auditor</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Local</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Itens Auditados</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {getRelatedAudits(selectedSchedule).map((audit: any, index: number) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{audit.date}</td>
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