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

type ApiResponse = { results: Array<Record<string, any>> }

let rdkitPromise: ReturnType<typeof initRDKitModule> | null = null
function getRDKit() {
  if (!rdkitPromise) {
    rdkitPromise = initRDKitModule({
      locateFile: (file: string) =>
        path.resolve(process.cwd(), 'node_modules', '@rdkit', 'rdkit', 'dist', file),
    })
  }
  return rdkitPromise
}

// tiny helpers

const HEX_POPCOUNT = [0,1,1,2,1,2,2,3,1,2,2,3,2,3,3,4]

function tanimoto(fpA: string, fpB: string, RDKit: any): number {
  if (RDKit.get_tanimoto) return Number(RDKit.get_tanimoto(fpA, fpB))
  // assume hex strings
  const len = Math.min(fpA.length, fpB.length)
  let inter = 0, a1 = 0, b1 = 0
  for (let i = 0; i < len; i++) {
    const a = parseInt(fpA[i], 16)
    const b = parseInt(fpB[i], 16)
    if (Number.isNaN(a) || Number.isNaN(b)) continue
    inter += HEX_POPCOUNT[a & b]
    a1 += HEX_POPCOUNT[a]
    b1 += HEX_POPCOUNT[b]
  }
  const union = a1 + b1 - inter
  return union === 0 ? 0 : inter / union
}

function molFromSmiles(RDKit: any, s: string) {
  try {
    const m = RDKit.get_mol(s)
    // some builds expose is_valid
    if (m && typeof m.is_valid === 'function' && !m.is_valid()) return null
    return m
  } catch {
    return null
  }
}

function morganFpHex(mol: any): string {
  // RDKit JS returns hex by default for get_morgan_fp
  return mol.get_morgan_fp('2') as string
}

function trySvg(mol: any, w = 300, h = 300): string | undefined {
  try {
    if (typeof mol.get_svg === 'function') return mol.get_svg(w, h)
  } catch {}
  return undefined
}

async function processOne(smiles: string, RDKit: any, rows: PermeabilityRow[]): Promise<ApiResponse> {
  const qMol = molFromSmiles(RDKit, smiles)
  if (!qMol) throw new Error(`Invalid query SMILES: ${smiles}`)
  const qFp = morganFpHex(qMol)

  const scored = []
  for (let i = 0; i < rows.length; i++) {
    const s = rows[i].SMILES_ISO
    if (!s) continue
    const m = molFromSmiles(RDKit, s)
    if (!m) continue
    const fp = morganFpHex(m)
    const sim = tanimoto(qFp, fp, RDKit)
    scored.push({
      index: i,
      SMILES_ISO: s,
      similarity: Number(sim),
      PUBCHEM_SID: rows[i].PUBCHEM_SID,
      PUBCHEM_CID: rows[i].PUBCHEM_CID,
      Permeability: rows[i].Permeability,
      Outcome: rows[i].PUBCHEM_ACTIVITY_OUTCOME,
      imageData: trySvg(m),
    })
  }

  scored.sort((a, b) => b.similarity - a.similarity)
  return { results: scored.slice(0, 5) }
}

export async function POST(request: NextRequest) {
  try {
    const { smiles } = await request.json()

    const smilesArray =
      typeof smiles === 'string' ? [smiles] :
      Array.isArray(smiles) ? smiles.filter((s): s is string => typeof s === 'string' && s.trim().length > 0) :
      []

    if (smilesArray.length === 0) {
      return NextResponse.json(
        { error: 'Provide a SMILES string or an array of SMILES strings' },
        { status: 400 }
      )
    }

    if (!supabase) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })
    }

    const RDKit = await getRDKit()

    const { data: records, error: dbError } = await supabase
      .from('permeability')
      .select('*')

    if (dbError) {
      return NextResponse.json({ error: `Database error: ${dbError.message}` }, { status: 500 })
    }
    if (!records || records.length === 0) {
      return NextResponse.json({ error: 'No data found' }, { status: 404 })
    }

    const results = await Promise.all(
      smilesArray.map(async (s, index) => {
        try {
          return await processOne(s, RDKit, records as PermeabilityRow[])
        } catch (err) {
          return { results: [], error: { index, smiles: s, message: err instanceof Error ? err.message : 'Unknown error' } }
        }
      })
    )

    const errors = results
      .map(r => (r as any).error)
      .filter(Boolean)

    return NextResponse.json({
      results: results.map(r => ({ results: (r as ApiResponse).results ?? [] })),
      errors: errors.length ? errors : undefined,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Unexpected error' }, { status: 500 })
  }
}
