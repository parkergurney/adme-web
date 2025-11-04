import React from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { SimilarityResult } from '@/types'

interface ResultsTableProps {
  results: SimilarityResult[]
}

const ResultsTable = ({ results }: ResultsTableProps) => {
  return (
    <>
      <div className="border rounded-md overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Chemical Structure</TableHead>
              <TableHead>Tanimoto Score</TableHead>
              <TableHead>Permeability</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {results.length > 0 ? (
              results.map((r) => (
                <TableRow key={r.index}>
                  <TableCell>
                    <div className="flex flex-col items-center gap-2 min-w-[200px]">
                      {r.imageData ? (
                        <div
                          className="flex items-center justify-center bg-white rounded border p-2"
                          style={{ width: '200px', height: '200px', overflow: 'hidden' }}
                        >
                          <div
                            dangerouslySetInnerHTML={{ __html: r.imageData }}
                            style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center',
                              width: '100%',
                              height: '100%'
                            }}
                          />
                        </div>
                      ) : (
                        <div className="flex items-center justify-center bg-gray-100 rounded border p-2 text-gray-400 text-sm" style={{ width: '200px', height: '200px' }}>
                          Image unavailable
                        </div>
                      )}
                      <span className="font-mono text-xs text-muted-foreground max-w-[200px] truncate" title={r.SMILES_ISO}>
                        {r.SMILES_ISO}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{r.similarity.toFixed(4)}</TableCell>
                  <TableCell>{r.Permeability || 'N/A'}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground">
                  No results found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </>
  )
}

export default ResultsTable

