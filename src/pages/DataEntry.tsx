import { useState } from 'react'
import { Plus, Save, Trash2, AlertTriangle, X } from 'lucide-react'
import { AuditData, AuditItem } from '../types'

export default function DataEntry() {
  const [auditData, setAuditData] = useState<AuditData>({
    id: '',
    date: new Date().toISOString().split('T')[0],
    auditor: '',
    location: '',
    items: [],
    sectorInfo: {
      sectorName: '',
      totalComponents: 0,
      expectedComponents: 0,
      foundComponents: 0,
      notFoundBatches: 0,
      unregisteredBoxes: 0,
      wrongLocationBoxes: 0,
      quantityMismatches: 0,
      notes: ''
    }
  })

  const [newItem, setNewItem] = useState<Partial<AuditItem>>({
    productCode: '',
    productName: '',
    expectedQuantity: 0,
    actualQuantity: 0,
    batchNumber: '',
    boxNumber: '',
    correctLocation: '',
    actualLocation: '',
    notFoundBatches: 0,
    unregisteredBoxes: 0,
    wrongLocationBoxes: 0,
    quantityMismatches: 0
  })

  const [showErrorModal, setShowErrorModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState<AuditItem | null>(null)

  const addItem = () => {
    const item: AuditItem = {
      id: Date.now().toString(),
      productCode: newItem.productCode || '',
      productName: newItem.productName || '',
      expectedQuantity: newItem.expectedQuantity || 0,
      actualQuantity: newItem.actualQuantity || 0,
      batchNumber: newItem.batchNumber || '',
      boxNumber: newItem.boxNumber || '',
      correctLocation: newItem.correctLocation || '',
      actualLocation: newItem.actualLocation || '',
      notFoundBatches: newItem.notFoundBatches || 0,
      unregisteredBoxes: newItem.unregisteredBoxes || 0,
      wrongLocationBoxes: newItem.wrongLocationBoxes || 0,
      quantityMismatches: newItem.quantityMismatches || 0
    }

    setAuditData(prev => ({
      ...prev,
      items: [...prev.items, item]
    }))

    setNewItem({
      productCode: '',
      productName: '',
      expectedQuantity: 0,
      actualQuantity: 0,
      batchNumber: '',
      boxNumber: '',
      correctLocation: '',
      actualLocation: '',
      notFoundBatches: 0,
      unregisteredBoxes: 0,
      wrongLocationBoxes: 0,
      quantityMismatches: 0
    })
  }

  const removeItem = (id: string) => {
    setAuditData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== id)
    }))
  }

  const showItemErrors = (item: AuditItem) => {
    setSelectedItem(item)
    setShowErrorModal(true)
  }

  const saveAudit = () => {
    // Allow saving if there are items OR if sector information is filled
    const hasItems = auditData.items.length > 0
    const hasSectorInfo = auditData.sectorInfo && (
      auditData.sectorInfo.sectorName.trim() !== '' ||
      auditData.sectorInfo.totalComponents > 0 ||
      auditData.sectorInfo.expectedComponents > 0 ||
      auditData.sectorInfo.foundComponents > 0 ||
      auditData.sectorInfo.notFoundBatches > 0 ||
      auditData.sectorInfo.unregisteredBoxes > 0 ||
      auditData.sectorInfo.wrongLocationBoxes > 0 ||
      auditData.sectorInfo.quantityMismatches > 0 ||
      auditData.sectorInfo.notes.trim() !== ''
    )
    
    if (!hasItems && !hasSectorInfo) {
      alert('Por favor, adicione pelo menos um item OU preencha as informações do setor/rua antes de salvar.')
      return
    }

    const audits = JSON.parse(localStorage.getItem('audits') || '[]')
    const auditWithId = { ...auditData, id: Date.now().toString() }
    audits.push(auditWithId)
    localStorage.setItem('audits', JSON.stringify(audits))
    
    alert('Auditoria salva com sucesso!')
    setAuditData({
      id: '',
      date: new Date().toISOString().split('T')[0],
      auditor: '',
      location: '',
      items: [],
      sectorInfo: {
        sectorName: '',
        totalComponents: 0,
        expectedComponents: 0,
        foundComponents: 0,
        notFoundBatches: 0,
        unregisteredBoxes: 0,
        wrongLocationBoxes: 0,
        quantityMismatches: 0,
        notes: ''
      }
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Entrada de Dados da Auditoria
        </h2>
        <p className="text-gray-600">
          Preencha os dados da auditoria de estoque para análise posterior.
        </p>
      </div>

             {/* Audit Information */}
       <div className="card">
         <h3 className="text-lg font-semibold text-gray-900 mb-4">
           Informações da Auditoria
         </h3>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
           <div>
             <label className="block text-sm font-medium text-gray-700 mb-2">
               Data da Auditoria
             </label>
             <input
               type="date"
               value={auditData.date}
               onChange={(e) => setAuditData(prev => ({ ...prev, date: e.target.value }))}
               className="input-field"
             />
           </div>
           <div>
             <label className="block text-sm font-medium text-gray-700 mb-2">
               Auditor Responsável
             </label>
             <input
               type="text"
               value={auditData.auditor}
               onChange={(e) => setAuditData(prev => ({ ...prev, auditor: e.target.value }))}
               placeholder="Nome do auditor"
               className="input-field"
             />
           </div>
           <div>
             <label className="block text-sm font-medium text-gray-700 mb-2">
               Local da Auditoria
             </label>
             <input
               type="text"
               value={auditData.location}
               onChange={(e) => setAuditData(prev => ({ ...prev, location: e.target.value }))}
               placeholder="Setor/Área"
               className="input-field"
             />
           </div>
         </div>
       </div>

       {/* Sector Information */}
       <div className="card">
         <h3 className="text-lg font-semibold text-gray-900 mb-4">
           Informações do Setor/Rua
         </h3>
         <p className="text-sm text-gray-600 mb-4">
           💡 <strong>Dica:</strong> Você pode salvar as informações do setor/rua independentemente dos itens individuais. 
           Use o botão "Salvar Apenas Informações do Setor" para salvar apenas estes dados, ou "Salvar Auditoria Completa" 
           para salvar tudo (itens + setor).
         </p>
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
           <div className="sm:col-span-2 lg:col-span-1">
             <label className="block text-sm font-medium text-gray-700 mb-2">
               Nome do Setor/Rua
             </label>
             <input
               type="text"
               value={auditData.sectorInfo?.sectorName || ''}
               onChange={(e) => setAuditData(prev => ({ 
                 ...prev, 
                 sectorInfo: { 
                   ...prev.sectorInfo!, 
                   sectorName: e.target.value 
                 }
               }))}
               placeholder="Ex: Rua 25, Setor A"
               className="input-field"
             />
           </div>
           <div>
             <label className="block text-sm font-medium text-gray-700 mb-2">
               Total de Componentes
             </label>
             <input
               type="number"
               value={auditData.sectorInfo?.totalComponents || 0}
               onChange={(e) => setAuditData(prev => ({ 
                 ...prev, 
                 sectorInfo: { 
                   ...prev.sectorInfo!, 
                   totalComponents: parseInt(e.target.value) || 0 
                 }
               }))}
               placeholder="0"
               className="input-field"
             />
           </div>
           <div>
             <label className="block text-sm font-medium text-gray-700 mb-2">
               Componentes Esperados
             </label>
             <input
               type="number"
               value={auditData.sectorInfo?.expectedComponents || 0}
               onChange={(e) => setAuditData(prev => ({ 
                 ...prev, 
                 sectorInfo: { 
                   ...prev.sectorInfo!, 
                   expectedComponents: parseInt(e.target.value) || 0 
                 }
               }))}
               placeholder="0"
               className="input-field"
             />
           </div>
           <div>
             <label className="block text-sm font-medium text-gray-700 mb-2">
               Componentes Encontrados
             </label>
             <input
               type="number"
               value={auditData.sectorInfo?.foundComponents || 0}
               onChange={(e) => setAuditData(prev => ({ 
                 ...prev, 
                 sectorInfo: { 
                   ...prev.sectorInfo!, 
                   foundComponents: parseInt(e.target.value) || 0 
                 }
               }))}
               placeholder="0"
               className="input-field"
             />
           </div>
         </div>
         
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
           <div>
             <label className="block text-sm font-medium text-gray-700 mb-2">
               Lotes Não Encontrados
             </label>
             <input
               type="number"
               value={auditData.sectorInfo?.notFoundBatches || 0}
               onChange={(e) => setAuditData(prev => ({ 
                 ...prev, 
                 sectorInfo: { 
                   ...prev.sectorInfo!, 
                   notFoundBatches: parseInt(e.target.value) || 0 
                 }
               }))}
               placeholder="0"
               className="input-field"
             />
           </div>
           <div>
             <label className="block text-sm font-medium text-gray-700 mb-2">
               Caixas Não Cadastradas
             </label>
             <input
               type="number"
               value={auditData.sectorInfo?.unregisteredBoxes || 0}
               onChange={(e) => setAuditData(prev => ({ 
                 ...prev, 
                 sectorInfo: { 
                   ...prev.sectorInfo!, 
                   unregisteredBoxes: parseInt(e.target.value) || 0 
                 }
               }))}
               placeholder="0"
               className="input-field"
             />
           </div>
           <div>
             <label className="block text-sm font-medium text-gray-700 mb-2">
               Caixas em Local Errado
             </label>
             <input
               type="number"
               value={auditData.sectorInfo?.wrongLocationBoxes || 0}
               onChange={(e) => setAuditData(prev => ({ 
                 ...prev, 
                 sectorInfo: { 
                   ...prev.sectorInfo!, 
                   wrongLocationBoxes: parseInt(e.target.value) || 0 
                 }
               }))}
               placeholder="0"
               className="input-field"
             />
           </div>
           <div>
             <label className="block text-sm font-medium text-gray-700 mb-2">
               Quantidade Diferente
             </label>
             <input
               type="number"
               value={auditData.sectorInfo?.quantityMismatches || 0}
               onChange={(e) => setAuditData(prev => ({ 
                 ...prev, 
                 sectorInfo: { 
                   ...prev.sectorInfo!, 
                   quantityMismatches: parseInt(e.target.value) || 0 
                 }
               }))}
               placeholder="0"
               className="input-field"
             />
           </div>
         </div>

         <div className="mt-4">
           <label className="block text-sm font-medium text-gray-700 mb-2">
             Observações do Setor
           </label>
           <textarea
             value={auditData.sectorInfo?.notes || ''}
             onChange={(e) => setAuditData(prev => ({ 
               ...prev, 
               sectorInfo: { 
                 ...prev.sectorInfo!, 
                 notes: e.target.value 
               }
             }))}
             placeholder="Observações sobre a auditoria do setor..."
             className="input-field"
             rows={3}
           />
         </div>
         
         {/* Save Sector Info Button */}
         <div className="mt-6 flex justify-end">
           <button
             onClick={saveAudit}
             className="btn-primary flex items-center gap-2"
           >
             <Save className="w-4 h-4" />
             Salvar Apenas Informações do Setor
           </button>
         </div>
       </div>

      {/* Add New Item */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Adicionar Item
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Código do Produto
            </label>
            <input
              type="text"
              value={newItem.productCode}
              onChange={(e) => setNewItem(prev => ({ ...prev, productCode: e.target.value }))}
              placeholder="Código"
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome do Produto
            </label>
            <input
              type="text"
              value={newItem.productName}
              onChange={(e) => setNewItem(prev => ({ ...prev, productName: e.target.value }))}
              placeholder="Nome do produto"
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantidade Esperada
            </label>
            <input
              type="number"
              value={newItem.expectedQuantity}
              onChange={(e) => setNewItem(prev => ({ ...prev, expectedQuantity: parseInt(e.target.value) || 0 }))}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantidade Real
            </label>
            <input
              type="number"
              value={newItem.actualQuantity}
              onChange={(e) => setNewItem(prev => ({ ...prev, actualQuantity: parseInt(e.target.value) || 0 }))}
              className="input-field"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Número do Lote
            </label>
            <input
              type="text"
              value={newItem.batchNumber}
              onChange={(e) => setNewItem(prev => ({ ...prev, batchNumber: e.target.value }))}
              placeholder="Lote"
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Número da Caixa
            </label>
            <input
              type="text"
              value={newItem.boxNumber}
              onChange={(e) => setNewItem(prev => ({ ...prev, boxNumber: e.target.value }))}
              placeholder="Caixa"
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Local Correto
            </label>
            <input
              type="text"
              value={newItem.correctLocation}
              onChange={(e) => setNewItem(prev => ({ ...prev, correctLocation: e.target.value }))}
              placeholder="Local correto"
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Local Atual
            </label>
            <input
              type="text"
              value={newItem.actualLocation}
              onChange={(e) => setNewItem(prev => ({ ...prev, actualLocation: e.target.value }))}
              placeholder="Local atual"
              className="input-field"
            />
          </div>
        </div>

                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
           <div>
             <label className="block text-sm font-medium text-gray-700 mb-2">
               Quantidade de Lotes Não Encontrados
             </label>
             <input
               type="number"
               value={newItem.notFoundBatches || 0}
               onChange={(e) => setNewItem(prev => ({ ...prev, notFoundBatches: parseInt(e.target.value) || 0 }))}
               placeholder="0"
               className="input-field"
             />
           </div>
           <div>
             <label className="block text-sm font-medium text-gray-700 mb-2">
               Quantidade de Caixas Não Cadastradas
             </label>
             <input
               type="number"
               value={newItem.unregisteredBoxes || 0}
               onChange={(e) => setNewItem(prev => ({ ...prev, unregisteredBoxes: parseInt(e.target.value) || 0 }))}
               placeholder="0"
               className="input-field"
             />
           </div>
           <div>
             <label className="block text-sm font-medium text-gray-700 mb-2">
               Quantidade de Caixas em Local Errado
             </label>
             <input
               type="number"
               value={newItem.wrongLocationBoxes || 0}
               onChange={(e) => setNewItem(prev => ({ ...prev, wrongLocationBoxes: parseInt(e.target.value) || 0 }))}
               placeholder="0"
               className="input-field"
             />
           </div>
           <div>
             <label className="block text-sm font-medium text-gray-700 mb-2">
               Quantidade de Itens com Quantidade Diferente
             </label>
             <input
               type="number"
               value={newItem.quantityMismatches || 0}
               onChange={(e) => setNewItem(prev => ({ ...prev, quantityMismatches: parseInt(e.target.value) || 0 }))}
               placeholder="0"
               className="input-field"
             />
           </div>
         </div>

        <button
          onClick={addItem}
          className="mt-4 btn-primary flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Adicionar Item</span>
        </button>
      </div>

      {/* Items List */}
      {auditData.items.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Itens da Auditoria ({auditData.items.length})
          </h3>
          {/* Desktop Table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Produto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Esperado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Real
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lotes Não Encontrados
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Caixas Não Cadastradas
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Local Errado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantidade Diferente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {auditData.items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {item.productCode}
                        </div>
                        <div className="text-sm text-gray-500">
                          {item.productName}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.expectedQuantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.actualQuantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.notFoundBatches || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.unregisteredBoxes || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.wrongLocationBoxes || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.quantityMismatches || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-danger-600 hover:text-danger-900 p-1 rounded"
                          title="Remover item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => showItemErrors(item)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded"
                          title="Ver erros"
                        >
                          <AlertTriangle className="h-4 w-4" />
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
            {auditData.items.map((item) => (
              <div key={item.id} className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900">{item.productCode}</h4>
                    <p className="text-sm text-gray-500">{item.productName}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-danger-600 hover:text-danger-900 p-1 rounded"
                      title="Remover item"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => showItemErrors(item)}
                      className="text-blue-600 hover:text-blue-900 p-1 rounded"
                      title="Ver erros"
                    >
                      <AlertTriangle className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-500">Esperado:</span>
                    <span className="ml-1 font-medium">{item.expectedQuantity}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Real:</span>
                    <span className="ml-1 font-medium">{item.actualQuantity}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Lotes Não Encontrados:</span>
                    <span className="ml-1 font-medium">{item.notFoundBatches || 0}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Caixas Não Cadastradas:</span>
                    <span className="ml-1 font-medium">{item.unregisteredBoxes || 0}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Local Errado:</span>
                    <span className="ml-1 font-medium">{item.wrongLocationBoxes || 0}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Quantidade Diferente:</span>
                    <span className="ml-1 font-medium">{item.quantityMismatches || 0}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={saveAudit}
          className="btn-primary flex items-center space-x-2"
        >
          <Save className="h-4 w-4" />
                   <span>Salvar Auditoria Completa</span>
       </button>
     </div>

     {/* Error Modal */}
     {showErrorModal && selectedItem && (
       <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
         <div className="bg-white rounded-lg p-4 sm:p-6 max-w-md w-full mx-4">
           <div className="flex justify-between items-center mb-4">
             <h3 className="text-lg font-semibold text-gray-900">
               Resumo de Erros - {selectedItem.productName}
             </h3>
             <button
               onClick={() => setShowErrorModal(false)}
               className="text-gray-400 hover:text-gray-600"
             >
               <X className="h-6 w-6" />
             </button>
           </div>
           
           <div className="space-y-4">
             <div className="border-b pb-3">
               <p className="text-sm font-medium text-gray-700 mb-2">Informações do Item:</p>
               <div className="grid grid-cols-2 gap-2 text-sm">
                 <div><span className="font-medium">Código:</span> {selectedItem.productCode}</div>
                 <div><span className="font-medium">Lote:</span> {selectedItem.batchNumber}</div>
                 <div><span className="font-medium">Caixa:</span> {selectedItem.boxNumber}</div>
                 <div><span className="font-medium">Local Correto:</span> {selectedItem.correctLocation}</div>
               </div>
             </div>

             <div className="border-b pb-3">
               <p className="text-sm font-medium text-gray-700 mb-2">Quantidades:</p>
               <div className="grid grid-cols-2 gap-2 text-sm">
                 <div><span className="font-medium">Esperado:</span> {selectedItem.expectedQuantity}</div>
                 <div><span className="font-medium">Real:</span> {selectedItem.actualQuantity}</div>
                 <div><span className="font-medium">Diferença:</span> {Math.abs(selectedItem.expectedQuantity - selectedItem.actualQuantity)}</div>
               </div>
             </div>

                            <div className="border-b pb-3">
                 <p className="text-sm font-medium text-gray-700 mb-2">Resumo de Erros:</p>
                 <div className="grid grid-cols-2 gap-2 text-sm">
                   <div><span className="font-medium">❌ Lotes Não Encontrados:</span> {selectedItem.notFoundBatches || 0}</div>
                   <div><span className="font-medium">📦 Caixas Não Cadastradas:</span> {selectedItem.unregisteredBoxes || 0}</div>
                   <div><span className="font-medium">⚠️ Local Errado:</span> {selectedItem.wrongLocationBoxes || 0}</div>
                   <div><span className="font-medium">🔢 Quantidade Diferente:</span> {selectedItem.quantityMismatches || 0}</div>
                 </div>
               </div>

               <div>
                 <p className="text-sm font-medium text-gray-700 mb-2">Localização:</p>
                 <div className="grid grid-cols-2 gap-2 text-sm">
                   <div><span className="font-medium">Correto:</span> {selectedItem.correctLocation}</div>
                   <div><span className="font-medium">Atual:</span> {selectedItem.actualLocation}</div>
                   {selectedItem.correctLocation !== selectedItem.actualLocation && (
                     <div className="col-span-2 text-red-600 font-medium">
                       ⚠️ Item em local incorreto!
                     </div>
                   )}
                 </div>
               </div>
           </div>

           <div className="mt-6 flex justify-end">
             <button
               onClick={() => setShowErrorModal(false)}
               className="btn-secondary"
             >
               Fechar
             </button>
           </div>
         </div>
       </div>
     )}
   </div>
 )
} 