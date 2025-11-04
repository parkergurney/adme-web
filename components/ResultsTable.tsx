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
                  <TableCell className="font-mono text-sm">{r.SMILES_ISO}</TableCell>
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

