declare module '@rdkit/rdkit' {
  export type RDKitMol = {
    is_valid?: () => boolean
    get_morgan_fp: (radius?: number | string, nBits?: number) => any
  }

  export type RDKitModule = {
    get_mol: (smiles: string) => RDKitMol | null
    get_tanimoto?: (fpA: any, fpB: any) => number
  }

  export interface RDKitInitOptions {
    locateFile?: (file: string) => string
  }

  const initRDKitModule: (options?: RDKitInitOptions) => Promise<RDKitModule>
  export default initRDKitModule
}

