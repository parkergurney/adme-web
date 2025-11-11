'use client'
import React, { useState, useEffect } from 'react'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import ProjectSidebar from '@/components/ProjectSidebar'
import Header from '@/components/Header'
import type { Project } from '@/types'

type CompoundData = {
  cid: number
  mf: string
  mw: number
  iupac: string
  smiles: string
  inchiKey: string
  aliases: string
  image: string
  tanimoto: number
}

const similarCompounds: CompoundData[] = [
  {
    cid: 7021,
    mf: 'C2H4O2',
    mw: 60.05,
    iupac: 'acetic acid',
    smiles: 'CC(=O)O',
    inchiKey: 'QTBSBXVTEAMEQO-UHFFFAOYSA-N',
    aliases: 'acetic acid; 64-19-7; ethanoic acid; vinegar acid',
    image: '/images/acetic_acid.png',
    tanimoto: 0.78,
  },
  {
    cid: 312,
    mf: 'C3H8O',
    mw: 60.10,
    iupac: 'propan-1-ol',
    smiles: 'CCC(O)',
    inchiKey: 'PTDANMLQXKZVFG-UHFFFAOYSA-N',
    aliases: '1-propanol; 71-23-8; n-propyl alcohol',
    image: '/images/propanol.png',
    tanimoto: 0.75,
  },
  {
    cid: 891,
    mf: 'C4H10O',
    mw: 74.12,
    iupac: 'butan-1-ol',
    smiles: 'CCCCO',
    inchiKey: 'RWWTYLLQGRVZSA-UHFFFAOYSA-N',
    aliases: '1-butanol; 71-36-3; n-butyl alcohol',
    image: '/images/butanol.png',
    tanimoto: 0.72,
  },
  {
    cid: 802,
    mf: 'C3H6O2',
    mw: 74.08,
    iupac: 'methyl acetate',
    smiles: 'CC(=O)OC',
    inchiKey: 'OKKJLVBELUTLKV-UHFFFAOYSA-N',
    aliases: 'methyl acetate; 79-20-9; acetic acid methyl ester',
    image: '/images/methyl_acetate.png',
    tanimoto: 0.70,
  },
  {
    cid: 867,
    mf: 'C4H8O',
    mw: 72.11,
    iupac: 'butan-2-one',
    smiles: 'CCC(=O)C',
    inchiKey: 'FPYMKYJIVZDCJL-UHFFFAOYSA-N',
    aliases: 'butanone; 78-93-3; methyl ethyl ketone',
    image: '/images/butanone.png',
    tanimoto: 0.68,
  },
  {
    cid: 175,
    mf: 'C3H4O2',
    mw: 72.06,
    iupac: 'prop-2-enoic acid',
    smiles: 'C=CC(=O)O',
    inchiKey: 'VJZDGHJIRGXXHG-UHFFFAOYSA-N',
    aliases: 'acrylic acid; 79-10-7; 2-propenoic acid',
    image: '/images/acrylic_acid.png',
    tanimoto: 0.65,
  },
  {
    cid: 8023,
    mf: 'C2H6O2',
    mw: 62.07,
    iupac: 'ethylene glycol',
    smiles: 'C(CO)O',
    inchiKey: 'XLYOFNOQVPJJNP-UHFFFAOYSA-N',
    aliases: 'ethylene glycol; 107-21-1; 1,2-ethanediol',
    image: '/images/ethylene_glycol.png',
    tanimoto: 0.62,
  },
  {
    cid: 803,
    mf: 'C3H8O',
    mw: 60.10,
    iupac: 'isopropanol',
    smiles: 'CC(O)C',
    inchiKey: 'BFIYKYHOXTHLZB-UHFFFAOYSA-N',
    aliases: 'isopropanol; 67-63-0; 2-propanol',
    image: '/images/isopropanol.png',
    tanimoto: 0.60,
  },
  {
    cid: 191,
    mf: 'C2H4O',
    mw: 44.05,
    iupac: 'ethanal',
    smiles: 'CC=O',
    inchiKey: 'LFQSCWFLJHTTHZ-UHFFFAOYSA-N',
    aliases: 'ethanal; 75-07-0; acetaldehyde',
    image: '/images/ethanal.png',
    tanimoto: 0.58,
  },
  {
    cid: 156,
    mf: 'C3H6O',
    mw: 58.08,
    iupac: 'propionaldehyde',
    smiles: 'CCC=O',
    inchiKey: 'HPDVLXTFZRWQJT-UHFFFAOYSA-N',
    aliases: 'propionaldehyde; 123-38-6; propanal',
    image: '/images/propionaldehyde.png',
    tanimoto: 0.57,
  },
  {
    cid: 9001,
    mf: 'C4H8O2',
    mw: 88.11,
    iupac: 'ethyl acetate',
    smiles: 'CCOC(=O)C',
    inchiKey: 'RVZKYUHHBXWPLW-UHFFFAOYSA-N',
    aliases: 'ethyl acetate; 141-78-6; acetic acid ethyl ester',
    image: '/images/ethyl_acetate.png',
    tanimoto: 0.55,
  },
  {
    cid: 9012,
    mf: 'C4H10O2',
    mw: 90.12,
    iupac: '1,2-butanediol',
    smiles: 'CC(O)C(O)C',
    inchiKey: 'YKXUBOZVUMVTAA-UHFFFAOYSA-N',
    aliases: '1,2-butanediol; 110-63-4; butane-1,2-diol',
    image: '/images/butanediol.png',
    tanimoto: 0.53,
  },
  {
    cid: 9200,
    mf: 'C5H12O',
    mw: 88.15,
    iupac: 'pentanol',
    smiles: 'CCCCCO',
    inchiKey: 'KJHASLDJQWERTY-UHFFFAOYSA-N',
    aliases: 'pentanol; 71-41-0; n-pentyl alcohol',
    image: '/images/pentanol.png',
    tanimoto: 0.52,
  },
  {
    cid: 9300,
    mf: 'C5H10O',
    mw: 86.13,
    iupac: '2-pentanone',
    smiles: 'CCCC(=O)C',
    inchiKey: 'ASDJKLQWERTYUI-UHFFFAOYSA-N',
    aliases: '2-pentanone; 107-87-9; methyl propyl ketone',
    image: '/images/pentanone.png',
    tanimoto: 0.50,
  },
  {
    cid: 9400,
    mf: 'C6H12O',
    mw: 100.16,
    iupac: 'hexanol',
    smiles: 'CCCCCCO',
    inchiKey: 'QWERTYUIOPASDF-UHFFFAOYSA-N',
    aliases: 'hexanol; 111-27-3; n-hexyl alcohol',
    image: '/images/hexanol.png',
    tanimoto: 0.48,
  },
  {
    cid: 9500,
    mf: 'C6H12O',
    mw: 102.16,
    iupac: '2-hexanone',
    smiles: 'CCCC(C)=O',
    inchiKey: 'ZXCVBNMASDFGHJ-UHFFFAOYSA-N',
    aliases: '2-hexanone; 591-78-6; methyl butyl ketone',
    image: '/images/hexanone.png',
    tanimoto: 0.45,
  },
  {
    cid: 9600,
    mf: 'C7H14O',
    mw: 116.18,
    iupac: 'heptanol',
    smiles: 'CCCCCCCO',
    inchiKey: 'ASDFGHJKLQWERTY-UHFFFAOYSA-N',
    aliases: 'heptanol; 111-70-6; n-heptyl alcohol',
    image: '/images/heptanol.png',
    tanimoto: 0.43,
  },
  {
    cid: 9700,
    mf: 'C8H16O',
    mw: 130.22,
    iupac: 'octanol',
    smiles: 'CCCCCCCCO',
    inchiKey: 'ZQWERTYUIOPASDF-UHFFFAOYSA-N',
    aliases: 'octanol; 111-87-5; n-octyl alcohol',
    image: '/images/octanol.png',
    tanimoto: 0.41,
  },
  {
    cid: 9800,
    mf: 'C7H12O',
    mw: 112.17,
    iupac: '2-heptanone',
    smiles: 'CCCCCC(=O)C',
    inchiKey: 'POIUYTREWQLKJH-UHFFFAOYSA-N',
    aliases: '2-heptanone; 110-43-0; methyl pentyl ketone',
    image: '/images/heptanone.png',
    tanimoto: 0.40,
  }
]

function CompoundCard({ compound }: { compound: CompoundData }) {
  // Generate image path from SMILES
  const imagePath = `/images/${compound.smiles}.png`
  
  return (
    <div className="bg-white rounded shadow-sm p-5 mb-4">
      <div className="flex gap-5">
        <div className="flex-shrink-0 w-32 h-32 bg-gray-50 border border-gray-200 rounded flex items-center justify-center overflow-hidden">
          <img 
            src={imagePath} 
            alt={compound.iupac}
            className="w-full h-full object-contain"
            onError={(e) => {
              // Fallback if image doesn't exist
              e.currentTarget.style.display = 'none'
              e.currentTarget.parentElement!.innerHTML = '<span class="text-gray-400 text-xs">Structure</span>'
            }}
          />
        </div>

        <div className="flex-1 min-w-0 text-sm leading-relaxed">
          <div className="mb-2">
            <span className="text-gray-900">{compound.aliases}</span>
          </div>

          <div className="mb-1.5 text-xs">
            <span className="font-semibold text-gray-900">Compound CID: </span>
            <a 
              href={`https://pubchem.ncbi.nlm.nih.gov/compound/${compound.cid}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              {compound.cid}
            </a>
          </div>

          <div className="mb-1.5 text-xs">
            <span className="font-semibold text-gray-900">MF: </span>
            <span className="text-blue-600">{compound.mf}</span>
            <span className="ml-4 font-semibold text-gray-900">MW: </span>
            <span className="text-gray-900">{compound.mw} g/mol</span>
          </div>

          <div className="mb-1.5 text-xs">
            <span className="font-semibold text-gray-900">IUPAC Name: </span>
            <span className="text-gray-900">{compound.iupac}</span>
          </div>

          <div className="mb-1.5 text-xs">
            <span className="font-semibold text-gray-900">SMILES: </span>
            <span className="text-gray-900 font-mono break-all">{compound.smiles}</span>
          </div>

          <div className="mb-1.5 text-xs">
            <span className="font-semibold text-gray-900">InChIKey: </span>
            <span className="text-gray-900 font-mono">{compound.inchiKey}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ResultsPage() {
  const [currentPage, setCurrentPage] = useState(1)
  const [results] = useState<CompoundData[]>(similarCompounds)
  const [projects, setProjects] = useState<Project[]>([
    { id: 'p1', name: 'Project 1', results: [] },
  ])
  const [currentProjectId, setCurrentProjectId] = useState<string | undefined>(undefined)
  const [isLoaded, setIsLoaded] = useState(false)
  
  const itemsPerPage = 3

  useEffect(() => {
    const stored = localStorage.getItem('adme-projects')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setProjects(parsed)
        if (parsed.length > 0 && !currentProjectId) {
          setCurrentProjectId(parsed[0].id)
        }
      } catch {
        // Keep default
      }
    }
    
    const storedCurrentProjectId = localStorage.getItem('adme-current-project-id')
    if (storedCurrentProjectId) {
      setCurrentProjectId(storedCurrentProjectId)
    } else if (projects.length > 0) {
      setCurrentProjectId(projects[0].id)
    }

    // Trigger animation after mount
    setTimeout(() => setIsLoaded(true), 100)
  }, [])

  const handleProjectChange = (projectId: string) => {
    setCurrentProjectId(projectId)
    if (typeof window !== 'undefined') {
      localStorage.setItem('adme-current-project-id', projectId)
    }
  }

  const totalPages = Math.ceil(results.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentResults = results.slice(startIndex, endIndex)

  return (
    <SidebarProvider>
      <ProjectSidebar
        projects={projects}
        currentProjectId={currentProjectId}
        onProjectChange={handleProjectChange}
        currentUser={{ name: 'User' }}
      />

      <SidebarInset>
        <div className="flex h-full w-full flex-col">
          <div className={`border-b border-gray-200 px-6 py-4 transition-all duration-700 ${
            isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
          }`}>
            <h1 className="text-2xl font-semibold">Project 2</h1>
          </div>

          <main className="flex-1 p-6 overflow-auto">
            <div className={`max-w-6xl mx-auto h-full transition-all duration-700 delay-200 ${
              isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}>
              {/* Header Section */}
              <div className="mb-4 flex items-center gap-2">
                <h2 className="text-base font-normal text-gray-900">
                  Candidate list ({results.length} compounds)
                </h2>
                <button className="text-gray-600 hover:text-gray-800">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M11 3H3v10h8V3z"/>
                    <path d="M5 5h4M5 7h4M5 9h4"/>
                  </svg>
                </button>
              </div>

              {/* Results */}
              <div className="space-y-0">
                {currentResults.map((compound, idx) => (
                  <div
                    key={compound.cid}
                    className="transition-all duration-500"
                    style={{
                      animation: isLoaded ? `slideIn 0.5s ease-out ${idx * 0.1}s both` : 'none'
                    }}
                  >
                    <CompoundCard compound={compound} />
                  </div>
                ))}
              </div>

              <style jsx>{`
                @keyframes slideIn {
                  from {
                    opacity: 0;
                    transform: translateX(-20px);
                  }
                  to {
                    opacity: 1;
                    transform: translateX(0);
                  }
                }
              `}</style>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-6">
                  {Array.from({ length: Math.min(3, totalPages) }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`min-w-[32px] h-8 px-2 flex items-center justify-center text-sm rounded ${
                        currentPage === page
                          ? 'bg-gray-900 text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  
                  {totalPages > 3 && (
                    <>
                      <span className="text-gray-500">...</span>
                      <button
                        onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="px-3 h-8 flex items-center justify-center text-sm rounded text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next →
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}