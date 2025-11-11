import React, { useState } from 'react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { AlertTriangle, Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { SimilarityResult } from '@/types'
import { cn } from '@/lib/utils'

interface AdmetProperty {
  property: string
  prediction: string | number
  drugbankPercentile?: string
  warning?: boolean
}

interface AdmetSection {
  letter: string
  name: string
  properties: AdmetProperty[]
  warnings?: string[]
}

interface AdmetProps {
  compound: SimilarityResult | null
}

// Mock ADMET data structure - replace with actual data when available
const getAdmetData = (compound: SimilarityResult | null): AdmetSection[] => {
  if (!compound) return []
  
  // This is placeholder data - replace with actual API data when available
  return [
    {
      letter: 'A',
      name: 'ABSORPTION',
      properties: [
        {
          property: 'Human Intestinal Absorption',
          prediction: '1.00',
          drugbankPercentile: '31.76%'
        },
        {
          property: 'Oral absorption',
          prediction: '-4.63',
          drugbankPercentile: '40.40%',
          warning: true
        },
        {
          property: 'PAMPA Permeability',
          prediction: '0.88',
          drugbankPercentile: '63.05%'
        }
      ],
      warnings: ['Risk of poor absorption due to low oral absorption']
    },
    {
      letter: 'D',
      name: 'DISTRIBUTION',
      properties: [
        {
          property: 'Volume of Distribution',
          prediction: '0.45',
          drugbankPercentile: '52.30%'
        },
        {
          property: 'Plasma Protein Binding',
          prediction: '85.2%',
          drugbankPercentile: '48.15%'
        }
      ]
    },
    {
      letter: 'M',
      name: 'METABOLISM',
      properties: [
        {
          property: 'CYP450 2D6 Substrate',
          prediction: 'No',
          drugbankPercentile: 'N/A'
        },
        {
          property: 'CYP450 3A4 Substrate',
          prediction: 'Yes',
          drugbankPercentile: 'N/A'
        }
      ]
    },
    {
      letter: 'E',
      name: 'EXCRETION',
      properties: [
        {
          property: 'Renal Clearance',
          prediction: '0.32',
          drugbankPercentile: '45.20%'
        }
      ]
    },
    {
      letter: 'T',
      name: 'TOXICITY',
      properties: [
        {
          property: 'LD50',
          prediction: '1250 mg/kg',
          drugbankPercentile: 'N/A'
        },
        {
          property: 'hERG Inhibition',
          prediction: 'Low',
          drugbankPercentile: 'N/A'
        }
      ]
    }
  ]
}

const Admet = ({ compound }: AdmetProps) => {
  const [copied, setCopied] = useState(false)
  const admetData = getAdmetData(compound)
  const [expandedSection, setExpandedSection] = useState<string>('A')

  const handleCopy = async () => {
    if (compound?.SMILES_ISO) {
      await navigator.clipboard.writeText(compound.SMILES_ISO)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (!compound) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        Select a compound to view ADMET properties
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* SMILES Display */}
      <div className="border-b p-4 bg-white">
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm text-muted-foreground break-all flex-1">
            {compound.SMILES_ISO}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="h-8 w-8 p-0"
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-600" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* ADMET Accordion */}
      <div className="flex-1 overflow-y-auto p-4">
        <Accordion
          type="single"
          collapsible
          value={expandedSection}
          onValueChange={setExpandedSection}
          className="w-full"
        >
          {admetData.map((section) => (
            <AccordionItem
              key={section.letter}
              value={section.letter}
              className={cn(
                "border rounded-lg mb-2",
                expandedSection === section.letter && "bg-muted/50"
              )}
            >
              <AccordionTrigger className="px-4 hover:no-underline">
                <span className="font-semibold">
                  {section.letter} - {section.name}
                </span>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="space-y-4">
                  {/* Properties Table */}
                  <div className="border rounded-md overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Property</TableHead>
                          <TableHead>Prediction</TableHead>
                          <TableHead>DrugBank Percentile</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {section.properties.map((prop, idx) => (
                          <TableRow key={idx}>
                            <TableCell className="flex items-center gap-2">
                              {prop.warning && (
                                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                              )}
                              {prop.property}
                            </TableCell>
                            <TableCell>{prop.prediction}</TableCell>
                            <TableCell>{prop.drugbankPercentile || 'N/A'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Warnings */}
                  {section.warnings && section.warnings.length > 0 && (
                    <div className="space-y-2">
                      {section.warnings.map((warning, idx) => (
                        <div
                          key={idx}
                          className="bg-red-50 border border-red-200 rounded-md p-3 text-sm text-red-800"
                        >
                          {warning}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  )
}

export default Admet
