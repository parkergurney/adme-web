// API Response Types
export type SimilarityResult = {
  index: number
  SMILES_ISO: string
  similarity: number
  PUBCHEM_SID?: string
  PUBCHEM_CID?: string
  Permeability?: string
  Outcome?: string
  imageData?: string // SVG string for molecule drawing
}

export type ApiResponse = {
  results: SimilarityResult[]
}

// UI State Types
export type Selection = {
  projectId: string
  queryId: string
  resultId: string
} | null

// Project/Query Types (re-exported from ProjectSidebar for convenience)
export type QueryResult = { id: string; label: string; onSelect?: (id: string) => void }
export type Query = { id: string; title: string; results: QueryResult[] }
export type Project = { id: string; name: string; queries: Query[]; pinned?: boolean }

