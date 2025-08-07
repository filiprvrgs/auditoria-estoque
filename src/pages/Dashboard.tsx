import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'
import { TrendingUp, AlertTriangle, Package, MapPin, CheckCircle, XCircle, Trash2, Eye, X } from 'lucide-react'
import { AuditData, AuditSummary, SectorErrorData } from '../types'

export default function Dashboard() {
  const [audits, setAudits] = useState<AuditData[]>([])
  const [summary, setSummary] = useState<AuditSummary>({
    totalItems: 0,
    auditedQuantity: 0,
    realQuantity: 0,
    errorMargin: 0,
    notFoundBatches: 0,
    unregisteredBoxes: 0,
    wrongLocationBoxes: 0,
    quantityMismatches: 0,
    accuracyPercentage: 0
  })

  // Estados para modais
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedAudit, setSelectedAudit] = useState<AuditData | null>(null)

  useEffect(() => {
    const savedAudits = JSON.parse(localStorage.getItem('audits') || '[]')
    setAudits(savedAudits)
    calculateSummary(savedAudits)
  }, [])

  const calculateSummary = (auditData: AuditData[]) => {
    let totalItems = 0
    let auditedQuantity = 0
    let realQuantity = 0
    let notFoundBatches = 0
    let unregisteredBoxes = 0
    let wrongLocationBoxes = 0
    let quantityMismatches = 0

    auditData.forEach(audit => {
      // Process items
      audit.items.forEach(item => {
        totalItems++
        auditedQuantity += item.expectedQuantity
        realQuantity += item.actualQuantity

        notFoundBatches += item.notFoundBatches || 0
        unregisteredBoxes += item.unregisteredBoxes || 0
        wrongLocationBoxes += item.wrongLocationBoxes || 0
        quantityMismatches += item.quantityMismatches || 0
      })

      // Process sector info if available
      if (audit.sectorInfo) {
        auditedQuantity += audit.sectorInfo.expectedComponents
        realQuantity += audit.sectorInfo.foundComponents

        if (audit.usesBatches) {
          notFoundBatches += audit.sectorInfo.notFoundBatches
          unregisteredBoxes += audit.sectorInfo.unregisteredBoxes
          wrongLocationBoxes += audit.sectorInfo.wrongLocationBoxes
        }
        quantityMismatches += audit.sectorInfo.quantityMismatches
      }
    })

    const errorMargin = Math.abs(auditedQuantity - realQuantity)
    const accuracyPercentage = auditedQuantity > 0 ? ((auditedQuantity - errorMargin) / auditedQuantity) * 100 : 0

    setSummary({
      totalItems,
      auditedQuantity,
      realQuantity,
      errorMargin,
      notFoundBatches,
      unregisteredBoxes,
      wrongLocationBoxes,
      quantityMismatches,
      accuracyPercentage
    })
  }

  const getChartData = () => {
    let notFoundBatches = 0
    let unregisteredBoxes = 0
    let wrongLocationBoxes = 0
    let quantityMismatches = 0

    audits.forEach(audit => {
      audit.items.forEach(item => {
        notFoundBatches += item.notFoundBatches || 0
        unregisteredBoxes += item.unregisteredBoxes || 0
        wrongLocationBoxes += item.wrongLocationBoxes || 0
        quantityMismatches += item.quantityMismatches || 0
      })

      // Include sector info
      if (audit.sectorInfo && audit.usesBatches) {
        notFoundBatches += audit.sectorInfo.notFoundBatches
        unregisteredBoxes += audit.sectorInfo.unregisteredBoxes
        wrongLocationBoxes += audit.sectorInfo.wrongLocationBoxes
      }
      if (audit.sectorInfo) {
        quantityMismatches += audit.sectorInfo.quantityMismatches
      }
    })

    return [
      { name: '❌ Lotes Não Encontrados', value: notFoundBatches, color: '#ef4444' },
      { name: '📦 Caixas Não Cadastradas', value: unregisteredBoxes, color: '#6b7280' },
      { name: '⚠️ Local Errado', value: wrongLocationBoxes, color: '#f59e0b' },
      { name: '🔢 Quantidade Diferente', value: quantityMismatches, color: '#3b82f6' }
    ].filter(item => item.value > 0)
  }

  const getQuantityComparisonData = () => {
    return audits.map(audit => {
      const itemExpected = audit.items.reduce((sum, item) => sum + item.expectedQuantity, 0)
      const itemActual = audit.items.reduce((sum, item) => sum + item.actualQuantity, 0)
      const sectorExpected = audit.sectorInfo?.expectedComponents || 0
      const sectorActual = audit.sectorInfo?.foundComponents || 0
      
      return {
        name: audit.location || 'Local',
        esperado: itemExpected + sectorExpected,
        real: itemActual + sectorActual
      }
    })
  }

  const getErrorTrendData = () => {
    return audits.map(audit => {
      const itemErrors = {
        'Lotes Não Encontrados': audit.items.reduce((sum, item) => sum + (item.notFoundBatches || 0), 0),
        'Caixas Não Cadastradas': audit.items.reduce((sum, item) => sum + (item.unregisteredBoxes || 0), 0),
        'Local Errado': audit.items.reduce((sum, item) => sum + (item.wrongLocationBoxes || 0), 0),
        'Quantidade Diferente': audit.items.reduce((sum, item) => sum + (item.quantityMismatches || 0), 0)
      }

      // Add sector errors if available
      if (audit.sectorInfo) {
        if (audit.usesBatches) {
          itemErrors['Lotes Não Encontrados'] += audit.sectorInfo.notFoundBatches
          itemErrors['Caixas Não Cadastradas'] += audit.sectorInfo.unregisteredBoxes
          itemErrors['Local Errado'] += audit.sectorInfo.wrongLocationBoxes
        }
        itemErrors['Quantidade Diferente'] += audit.sectorInfo.quantityMismatches
      }

      return {
        name: audit.date,
        ...itemErrors
      }
    })
  }

  const getSectorErrorData = (): SectorErrorData[] => {
    const sectorErrors: { [key: string]: SectorErrorData } = {}
    
    audits.forEach(audit => {
      const location = audit.location || 'Sem Local'
      if (!sectorErrors[location]) {
        sectorErrors[location] = {
          sectorName: location,
          totalErrors: 0,
          expectedQuantity: 0,
          actualQuantity: 0,
          errorDifference: 0
        }
      }
      
      // Process items
      audit.items.forEach(item => {
        sectorErrors[location].expectedQuantity += item.expectedQuantity
        sectorErrors[location].actualQuantity += item.actualQuantity
        
        if (audit.usesBatches) {
          sectorErrors[location].totalErrors += (item.notFoundBatches || 0) + 
                                              (item.unregisteredBoxes || 0) + 
                                              (item.wrongLocationBoxes || 0)
        }
        sectorErrors[location].totalErrors += (item.quantityMismatches || 0)
      })

      // Process sector info
      if (audit.sectorInfo) {
        sectorErrors[location].expectedQuantity += audit.sectorInfo.expectedComponents
        sectorErrors[location].actualQuantity += audit.sectorInfo.foundComponents
        
        if (audit.usesBatches) {
          sectorErrors[location].totalErrors += audit.sectorInfo.notFoundBatches + 
                                              audit.sectorInfo.unregisteredBoxes + 
                                              audit.sectorInfo.wrongLocationBoxes
        }
        sectorErrors[location].totalErrors += audit.sectorInfo.quantityMismatches
      }

      // Calculate error difference
      sectorErrors[location].errorDifference = Math.abs(
        sectorErrors[location].expectedQuantity - sectorErrors[location].actualQuantity
      )
    })
    
    return Object.values(sectorErrors)
      .sort((a, b) => b.totalErrors - a.totalErrors)
      .slice(0, 5) // Top 5 setores com mais erros
  }

  const getSectorErrorDifferenceData = () => {
    const sectorErrors = getSectorErrorData()
    return sectorErrors.map(sector => ({
      name: sector.sectorName,
      'Diferença Esperado vs Real': sector.errorDifference,
      'Total de Erros': sector.totalErrors
    }))
  }

  const viewAuditDetails = (audit: AuditData) => {
    setSelectedAudit(audit)
    setShowDetailModal(true)
  }

  const confirmDeleteAudit = (audit: AuditData) => {
    setSelectedAudit(audit)
    setShowDeleteModal(true)
  }

  const removeAudit = () => {
    if (selectedAudit) {
      const updatedAudits = audits.filter(audit => audit.id !== selectedAudit.id)
      setAudits(updatedAudits)
      localStorage.setItem('audits', JSON.stringify(updatedAudits))
      calculateSummary(updatedAudits)
      setShowDeleteModal(false)
      setSelectedAudit(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Dashboard de Auditoria
        </h2>
        <p className="text-gray-600">
          Análise gráfica dos dados de auditoria de estoque.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Package className="h-8 w-8 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total de Itens</p>
              <p className="text-2xl font-semibold text-gray-900">{summary.totalItems}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingUp className="h-8 w-8 text-success-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Precisão</p>
              <p className="text-2xl font-semibold text-gray-900">{summary.accuracyPercentage.toFixed(1)}%</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-8 w-8 text-warning-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Margem de Erro</p>
              <p className="text-2xl font-semibold text-gray-900">{summary.errorMargin}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircle className="h-8 w-8 text-success-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Quantidade Real</p>
              <p className="text-2xl font-semibold text-gray-900">{summary.realQuantity}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Quantity Comparison Chart */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Quantidade Auditada vs Real
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={getQuantityComparisonData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="esperado" fill="#3b82f6" name="Esperado" />
              <Bar dataKey="real" fill="#22c55e" name="Real" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Error Distribution Pie Chart */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Distribuição de Erros
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={getChartData()}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {getChartData().map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Error Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Análise de Erros ao Longo do Tempo
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={getErrorTrendData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="Lotes Não Encontrados" stroke="#ef4444" strokeWidth={2} />
              <Line type="monotone" dataKey="Caixas Não Cadastradas" stroke="#6b7280" strokeWidth={2} />
              <Line type="monotone" dataKey="Local Errado" stroke="#f59e0b" strokeWidth={2} />
              <Line type="monotone" dataKey="Quantidade Diferente" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Setores com Mais Erros
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={getSectorErrorData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="sectorName" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="totalErrors" fill="#dc2626" name="Total de Erros" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* New Chart: Sector Error Difference */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Setores com Maior Diferença (Esperado vs Real)
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Análise dos setores com maior discrepância entre quantidade esperada e quantidade real encontrada.
        </p>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={getSectorErrorDifferenceData()}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="Diferença Esperado vs Real" fill="#ef4444" name="Diferença Esperado vs Real" />
            <Bar dataKey="Total de Erros" fill="#6b7280" name="Total de Erros" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">❌ Lotes Não Encontrados</p>
              <p className="text-3xl font-bold text-danger-600">{summary.notFoundBatches}</p>
            </div>
            <XCircle className="h-12 w-12 text-danger-500" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">📦 Caixas Não Cadastradas</p>
              <p className="text-3xl font-bold text-gray-600">{summary.unregisteredBoxes}</p>
            </div>
            <Package className="h-12 w-12 text-gray-500" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">⚠️ Local Errado</p>
              <p className="text-3xl font-bold text-warning-600">{summary.wrongLocationBoxes}</p>
            </div>
            <MapPin className="h-12 w-12 text-warning-500" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">🔢 Quantidade Diferente</p>
              <p className="text-3xl font-bold text-blue-600">{summary.quantityMismatches}</p>
            </div>
            <AlertTriangle className="h-12 w-12 text-blue-500" />
          </div>
        </div>
      </div>

      {/* Recent Audits Table */}
      {audits.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Auditorias Recentes
          </h3>
          {/* Desktop Table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Auditor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Local
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Itens
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Precisão
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {audits.slice(-5).reverse().map((audit) => {
                  const totalExpected = audit.items.reduce((sum, item) => sum + item.expectedQuantity, 0) + 
                                      (audit.sectorInfo?.expectedComponents || 0)
                  const totalActual = audit.items.reduce((sum, item) => sum + item.actualQuantity, 0) + 
                                    (audit.sectorInfo?.foundComponents || 0)
                  const accuracy = totalExpected > 0 ? ((totalExpected - Math.abs(totalExpected - totalActual)) / totalExpected) * 100 : 0

                  return (
                    <tr key={audit.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(audit.date).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {audit.auditor}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {audit.location}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          audit.entryType === 'rua' ? 'bg-blue-100 text-blue-800' :
                          audit.entryType === 'classe' ? 'bg-green-100 text-green-800' :
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {audit.entryType === 'rua' ? 'Rua' : 
                           audit.entryType === 'classe' ? 'Classe' : 'Produto'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {audit.items.length}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          accuracy >= 95 ? 'bg-success-100 text-success-800' :
                          accuracy >= 80 ? 'bg-warning-100 text-warning-800' :
                          'bg-danger-100 text-danger-800'
                        }`}>
                          {accuracy.toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => viewAuditDetails(audit)}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded"
                            title="Ver detalhes"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => confirmDeleteAudit(audit)}
                            className="text-danger-600 hover:text-danger-900 p-1 rounded"
                            title="Remover auditoria"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="lg:hidden space-y-4">
            {audits.slice(-5).reverse().map((audit) => {
              const totalExpected = audit.items.reduce((sum, item) => sum + item.expectedQuantity, 0) + 
                                  (audit.sectorInfo?.expectedComponents || 0)
              const totalActual = audit.items.reduce((sum, item) => sum + item.actualQuantity, 0) + 
                                (audit.sectorInfo?.foundComponents || 0)
              const accuracy = totalExpected > 0 ? ((totalExpected - Math.abs(totalExpected - totalActual)) / totalExpected) * 100 : 0

              return (
                <div key={audit.id} className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900">{audit.location}</h4>
                      <p className="text-sm text-gray-500">{audit.auditor}</p>
                      <p className="text-xs text-gray-400">{new Date(audit.date).toLocaleDateString('pt-BR')}</p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => viewAuditDetails(audit)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded"
                        title="Ver detalhes"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => confirmDeleteAudit(audit)}
                        className="text-danger-600 hover:text-danger-900 p-1 rounded"
                        title="Remover auditoria"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-500">Tipo:</span>
                      <span className={`ml-1 font-medium ${
                        audit.entryType === 'rua' ? 'text-blue-600' :
                        audit.entryType === 'classe' ? 'text-green-600' :
                        'text-purple-600'
                      }`}>
                        {audit.entryType === 'rua' ? 'Rua' : 
                         audit.entryType === 'classe' ? 'Classe' : 'Produto'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Itens:</span>
                      <span className="ml-1 font-medium">{audit.items.length}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Precisão:</span>
                      <span className={`ml-1 font-medium ${
                        accuracy >= 95 ? 'text-success-600' :
                        accuracy >= 80 ? 'text-warning-600' :
                        'text-danger-600'
                      }`}>
                        {accuracy.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedAudit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 sm:p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Detalhes da Auditoria - {selectedAudit.location}
              </h3>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 border-b pb-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Data</p>
                  <p className="text-sm text-gray-900">{new Date(selectedAudit.date).toLocaleDateString('pt-BR')}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Auditor</p>
                  <p className="text-sm text-gray-900">{selectedAudit.auditor}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Local</p>
                  <p className="text-sm text-gray-900">{selectedAudit.location}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Tipo</p>
                  <p className="text-sm text-gray-900">
                    {selectedAudit.entryType === 'rua' ? 'Rua' : 
                     selectedAudit.entryType === 'classe' ? 'Classe' : 'Produto'}
                  </p>
                </div>
              </div>

              {selectedAudit.sectorInfo && (
                <div className="border-b pb-4">
                  <h4 className="text-md font-semibold text-gray-900 mb-3">Informações do Setor</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-3">
                    <div className="text-center">
                      <p className="text-lg font-bold text-primary-600">
                        {selectedAudit.sectorInfo.sectorName}
                      </p>
                      <p className="text-xs text-gray-500">Nome do Setor</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-success-600">
                        {selectedAudit.sectorInfo.totalComponents}
                      </p>
                      <p className="text-xs text-gray-500">Total Componentes</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-info-600">
                        {selectedAudit.sectorInfo.expectedComponents}
                      </p>
                      <p className="text-xs text-gray-500">Esperados</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-warning-600">
                        {selectedAudit.sectorInfo.foundComponents}
                      </p>
                      <p className="text-xs text-gray-500">Encontrados</p>
                    </div>
                  </div>
                  {selectedAudit.sectorInfo.notes && (
                    <div className="bg-blue-50 p-3 rounded">
                      <p className="text-sm font-medium text-gray-700">Observações:</p>
                      <p className="text-sm text-gray-600">{selectedAudit.sectorInfo.notes}</p>
                    </div>
                  )}
                </div>
              )}

              <div className="border-b pb-4">
                <h4 className="text-md font-semibold text-gray-900 mb-3">Resumo de Erros</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-danger-600">
                      {selectedAudit.items.reduce((sum, item) => sum + (item.notFoundBatches || 0), 0) +
                       (selectedAudit.sectorInfo?.notFoundBatches || 0)}
                    </p>
                    <p className="text-xs text-gray-500">❌ Lotes Não Encontrados</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-600">
                      {selectedAudit.items.reduce((sum, item) => sum + (item.unregisteredBoxes || 0), 0) +
                       (selectedAudit.sectorInfo?.unregisteredBoxes || 0)}
                    </p>
                    <p className="text-xs text-gray-500">📦 Caixas Não Cadastradas</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-warning-600">
                      {selectedAudit.items.reduce((sum, item) => sum + (item.wrongLocationBoxes || 0), 0) +
                       (selectedAudit.sectorInfo?.wrongLocationBoxes || 0)}
                    </p>
                    <p className="text-xs text-gray-500">⚠️ Local Errado</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">
                      {selectedAudit.items.reduce((sum, item) => sum + (item.quantityMismatches || 0), 0) +
                       (selectedAudit.sectorInfo?.quantityMismatches || 0)}
                    </p>
                    <p className="text-xs text-gray-500">🔢 Quantidade Diferente</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-3">Itens Auditados ({selectedAudit.items.length})</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {selectedAudit.items.map((item) => (
                    <div key={item.id} className="bg-gray-50 p-3 rounded">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{item.productName || item.productCode}</p>
                          <p className="text-xs text-gray-500">Esperado: {item.expectedQuantity} | Real: {item.actualQuantity}</p>
                        </div>
                        <div className="text-right text-xs">
                          {selectedAudit.usesBatches && (
                            <>
                              <p className="text-gray-500">Lote: {item.batchNumber}</p>
                              <p className="text-gray-500">Caixa: {item.boxNumber}</p>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowDetailModal(false)}
                className="btn-secondary"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedAudit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 sm:p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-8 w-8 text-danger-500" />
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-semibold text-gray-900">
                  Confirmar Exclusão
                </h3>
              </div>
            </div>
            
            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-2">
                Tem certeza que deseja remover esta auditoria?
              </p>
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-sm font-medium text-gray-900">{selectedAudit.location}</p>
                <p className="text-xs text-gray-500">
                  {new Date(selectedAudit.date).toLocaleDateString('pt-BR')} - {selectedAudit.auditor}
                </p>
                <p className="text-xs text-gray-500">{selectedAudit.items.length} itens</p>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="btn-secondary"
              >
                Cancelar
              </button>
              <button
                onClick={removeAudit}
                className="btn-primary bg-danger-600 hover:bg-danger-700"
              >
                Remover
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 