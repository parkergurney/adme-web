'use client';

import React, { useEffect, useState } from 'react';
import compounds from '@/app/data/permeability.json';

let RDKit: any = null;
async function getRDKit() {
  if (!RDKit) {
    const RDKitModule = await import('@rdkit/rdkit');
    RDKit = await RDKitModule.default();
  }
  return RDKit;
}

const HEX_POPCOUNT = [0,1,1,2,1,2,2,3,1,2,2,3,2,3,3,4];

function tanimoto(fpA: string, fpB: string) {
  const len = Math.min(fpA.length, fpB.length);
  let inter = 0, a1 = 0, b1 = 0;
  for (let i = 0; i < len; i++) {
    const a = parseInt(fpA[i], 16);
    const b = parseInt(fpB[i], 16);
    if (isNaN(a) || isNaN(b)) continue;
    inter += HEX_POPCOUNT[a & b];
    a1 += HEX_POPCOUNT[a];
    b1 += HEX_POPCOUNT[b];
  }
  const union = a1 + b1 - inter;
  return union === 0 ? 0 : inter / union;
}

function molFromSmiles(RDKit: any, s: string) {
  try {
    const m = RDKit.get_mol(s);
    if (!m || (typeof m.is_valid === 'function' && !m.is_valid())) return null;
    return m;
  } catch {
    return null;
  }
}

function morganFpHex(mol: any) {
  return mol.get_morgan_fp('2');
}

function MoleculeSVG({ mol }: { mol: any }) {
  const [svg, setSvg] = useState('');
  useEffect(() => {
    if (!mol) return;
    try { if (mol.get_svg) setSvg(mol.get_svg(300, 300)); } catch {}
  }, [mol]);
  return <div dangerouslySetInnerHTML={{ __html: svg }} />;
}

interface ResultsPageProps {
  smilesList: string[];
}

export default function ResultsPage({ smilesList }: ResultsPageProps) {
  const [results, setResults] = useState<
    Array<{smiles: string, similar: Array<{smiles: string, mol: any, similarity: number}>}>
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const process = async () => {
      setLoading(true);
      const RDKit = await getRDKit();

      const processed = await Promise.all(
        smilesList.map(async (inputSmiles) => {
          const qMol = molFromSmiles(RDKit, inputSmiles);
          if (!qMol) return { smiles: inputSmiles, similar: [] };
          const qFp = morganFpHex(qMol);

          const scored: Array<{smiles: string, mol: any, similarity: number}> = [];
          for (const row of compounds) {
            const s = row.SMILES_ISO;
            const m = molFromSmiles(RDKit, s);
            if (!m) continue;
            const fp = morganFpHex(m);
            scored.push({ smiles: s, mol: m, similarity: tanimoto(qFp, fp) });
          }

          scored.sort((a, b) => b.similarity - a.similarity);
          return { smiles: inputSmiles, similar: scored.slice(0, 20) };
        })
      );

      setResults(processed);
      setLoading(false);
    };

    process();
  }, [smilesList]);

  if (loading) return <p>Loading top 20 similar compounds...</p>;

  return (
    <div>
      {results.map(res => (
        <div key={res.smiles} style={{ marginBottom: 40 }}>
          <h2>Input: {res.smiles}</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {res.similar.map((sim, i) => (
              <div key={i} style={{ border: '1px solid #ccc', padding: 5 }}>
                <MoleculeSVG mol={sim.mol} />
                <p>SMILES: {sim.smiles}</p>
                <p>Similarity: {sim.similarity.toFixed(2)}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
