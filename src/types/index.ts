export interface AuditData {
  id: string
  date: string
  auditor: string
  location: string
  items: AuditItem[]
  sectorInfo?: SectorInfo
  entryType: 'rua' | 'classe' | 'produto'
  usesBatches: boolean
}

export interface SectorInfo {
  sectorName: string
  totalComponents: number
  expectedComponents: number
  foundComponents: number
  notFoundBatches: number
  unregisteredBoxes: number
  wrongLocationBoxes: number
  quantityMismatches: number
  notes: string
}

export interface AuditItem {
  id: string
  productCode: string
  productName: string
  expectedQuantity: number
  actualQuantity: number
  batchNumber: string
  boxNumber: string
  correctLocation: string
  actualLocation: string
  notFoundBatches?: number
  unregisteredBoxes?: number
  wrongLocationBoxes?: number
  quantityMismatches?: number
}

export interface AuditSummary {
  totalItems: number
  auditedQuantity: number
  realQuantity: number
  errorMargin: number
  notFoundBatches: number
  unregisteredBoxes: number
  wrongLocationBoxes: number
  quantityMismatches: number
  accuracyPercentage: number
}

export interface SectorErrorData {
  sectorName: string
  totalErrors: number
  expectedQuantity: number
  actualQuantity: number
  errorDifference: number
} 