import React from 'react'
import type { SimilarityResult } from '@/types'
import { cn } from '@/lib/utils'

interface CompoundListProps {
  compounds: SimilarityResult[]
  selectedIndex: number | null
  onSelect: (index: number) => void
}

const CompoundList = ({ compounds, selectedIndex, onSelect }: CompoundListProps) => {
  return (
    <div className="flex flex-col h-full border-r bg-white">
      <div className="flex-1 overflow-y-auto">
        {compounds.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground text-sm">
            No compounds found
          </div>
        ) : (
          <div className="p-2 space-y-2">
            {compounds.map((compound, index) => (
              <div
                key={compound.index}
                onClick={() => onSelect(index)}
                className={cn(
                  "p-3 rounded-lg border cursor-pointer transition-colors hover:bg-accent",
                  selectedIndex === index && "border-green-500 bg-green-50/50 border-2"
                )}
              >
                <div className="flex flex-col gap-2">
                  {/* Chemical Structure */}
                  {compound.imageData ? (
                    <div
                      className="flex items-center justify-center bg-white rounded border p-2"
                      style={{ width: '100%', height: '120px', overflow: 'hidden' }}
                    >
                      <div
                        dangerouslySetInnerHTML={{ __html: compound.imageData }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '100%',
                          height: '100%',
                          transform: 'scale(0.8)'
                        }}
                      />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center bg-gray-100 rounded border p-2 text-gray-400 text-xs" style={{ height: '120px' }}>
                      Image unavailable
                    </div>
                  )}
                  
                  {/* SMILES String */}
                  <span className="font-mono text-xs text-muted-foreground break-all" title={compound.SMILES_ISO}>
                    {compound.SMILES_ISO}
                  </span>
                  
                  {/* Tanimoto Score */}
                  <div className="text-sm font-medium">
                    Tanimoto Score: <span className="text-primary">{compound.similarity.toFixed(4)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default CompoundList

