import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import initRDKitModule from '@rdkit/rdkit'
import { supabase } from '@/lib/supabase'

type PermeabilityRow = {
  PUBCHEM_SID: string | null
  PUBCHEM_CID: string | null
  SMILES_ISO: string
  PUBCHEM_ACTIVITY_OUTCOME: string | null
  Permeability: string | null
  [key: string]: string | null | undefined
}

let rdkitPromise: ReturnType<typeof initRDKitModule> | null = null
function getRDKit() {
  if (!rdkitPromise) {
    rdkitPromise = initRDKitModule({
      locateFile: (file: string) => path.resolve(process.cwd(), 'node_modules', '@rdkit', 'rdkit', 'dist', file),
    })
  }
  return rdkitPromise
}

function isBinaryStringFingerprint(fp: any): fp is string {
  return typeof fp === 'string' && /^[01]+$/.test(fp)
}

const HEX_POPCOUNT = [0,1,1,2,1,2,2,3,1,2,2,3,2,3,3,4]
function tanimotoFromFingerprints(fpA: any, fpB: any, RDKit: any): number {
  if (RDKit.get_tanimoto) return Number(RDKit.get_tanimoto(fpA, fpB))
  if (typeof fpA === 'string' && typeof fpB === 'string') {
    if (isBinaryStringFingerprint(fpA) && isBinaryStringFingerprint(fpB)) {
      const len = Math.min(fpA.length, fpB.length)
      let inter = 0, a1 = 0, b1 = 0
      for (let i = 0; i < len; i++) {
        const aBit = fpA.charCodeAt(i) === 49 // '1'
        const bBit = fpB.charCodeAt(i) === 49
        if (aBit) a1++
        if (bBit) b1++
        if (aBit && bBit) inter++
      }
      const union = a1 + b1 - inter
      return union === 0 ? 0 : inter / union
    }
    // assume hex strings
    const len = Math.min(fpA.length, fpB.length)
    let inter = 0, a1 = 0, b1 = 0
    for (let i = 0; i < len; i++) {
      const aNib = parseInt(fpA[i], 16)
      const bNib = parseInt(fpB[i], 16)
      if (Number.isNaN(aNib) || Number.isNaN(bNib)) continue
      inter += HEX_POPCOUNT[aNib & bNib]
      a1 += HEX_POPCOUNT[aNib]
      b1 += HEX_POPCOUNT[bNib]
    }
    const union = a1 + b1 - inter
    return union === 0 ? 0 : inter / union
  }
  throw new Error('Unsupported fingerprint format')
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const smiles: string | undefined = body?.smiles
    if (!smiles || typeof smiles !== 'string') {
      return NextResponse.json({ error: 'Missing required "smiles" in request body' }, { status: 400 })
    }

    const RDKit = await getRDKit()

    const queryMol = RDKit.get_mol(smiles)
    if (!queryMol || queryMol.is_valid?.() === false) {
      return NextResponse.json({ error: 'Invalid query SMILES' }, { status: 400 })
    }
    const queryFp = queryMol.get_morgan_fp('2')

    if (!supabase) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })
    }

    const { data: records, error: dbError } = await supabase
      .from('permeability')
      .select('*')

    if (dbError) {
      return NextResponse.json({ error: 'Database error: ' + dbError.message }, { status: 500 })
    }

    if (!records || records.length === 0) {
      return NextResponse.json({ error: 'No data found in database' }, { status: 404 })
    }

    const results: Array<Record<string, any>> = []
    for (let i = 0; i < records.length; i++) {
      const row = records[i] as PermeabilityRow
      const s = row.SMILES_ISO
      if (!s) continue
      
      try {
        const mol = RDKit.get_mol(s)
        if (!mol || mol.is_valid?.() === false) continue
        const fp = mol.get_morgan_fp('2')
        const sim = tanimotoFromFingerprints(queryFp, fp, RDKit)
        
        // Generate SVG image for the molecule
        let imageData: string | undefined
        try {
          if (mol.get_svg) {
            imageData = mol.get_svg(300, 300)
          }
        } catch (svgErr) {
          // If SVG generation fails, continue without image
          console.warn('Failed to generate SVG for molecule:', s, svgErr)
        }
        
        results.push({
          index: i,
          SMILES_ISO: s,
          similarity: Number(sim),
          PUBCHEM_SID: row.PUBCHEM_SID,
          PUBCHEM_CID: row.PUBCHEM_CID,
          Permeability: row.Permeability,
          Outcome: row.PUBCHEM_ACTIVITY_OUTCOME,
          imageData,
        })
      } catch (err) {
        // Skip invalid molecules
        continue
      }
    }

    results.sort((a, b) => b.similarity - a.similarity)
    const top5 = results.slice(0, 5)
    return NextResponse.json({ results: top5 }, { status: 200 })
  } catch (error: any) {
    console.error(error)
    return NextResponse.json({ error: error?.message || 'Unexpected error' }, { status: 500 })
  }
}