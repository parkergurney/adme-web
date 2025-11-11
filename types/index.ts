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
  resultId: string
} | null

// Project Result Type - each result represents one compound query
export type ProjectResult = {
  id: string
  label: string // SMILES string
  data: ApiResponse // The API response for this compound
}

// Project Type - simplified structure
export type Project = { 
  id: string
  name: string
  results: ProjectResult[]
  pinned?: boolean
}

