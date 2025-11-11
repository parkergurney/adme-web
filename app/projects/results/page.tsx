'use client'
import React, { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import ProjectSidebar from '@/components/ProjectSidebar'
import CompoundList from '@/components/CompoundList'
import Admet from '@/components/Admet'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react'
import type { Project, ApiResponse, Selection, SimilarityResult } from '@/types'
import Header from '@/components/Header'

function ResultsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [projects, setProjects] = useState<Project[]>([
    { id: 'p1', name: 'Project 1', results: [] },
  ])
  const [currentProjectId, setCurrentProjectId] = useState<string | undefined>(undefined)
  
  useEffect(() => {
    const storedProjects = localStorage.getItem('adme-projects')
    if (storedProjects) {
      try {
        const parsed = JSON.parse(storedProjects)
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
  }, [])

  const [selection, setSelection] = useState<Selection>(() => {
    const projectId = searchParams.get('projectId')
    const resultId = searchParams.get('resultId')
    
    if (projectId && resultId) {
      return { projectId, resultId }
    }
    return null
  })

  useEffect(() => {
    const projectId = searchParams.get('projectId')
    const resultId = searchParams.get('resultId')
    
    if (projectId && resultId) {
      setSelection({ projectId, resultId })
    } else {
      setSelection(null)
    }
		
    if (projectId) {
      setCurrentProjectId(projectId)
      if (typeof window !== 'undefined') {
        localStorage.setItem('adme-current-project-id', projectId)
      }
    }
  }, [searchParams])
  
  useEffect(() => {
    const urlProjectId = searchParams.get('projectId')
    if (!urlProjectId && currentProjectId) {
      router.replace(`/projects/results?projectId=${currentProjectId}`)
    }
  }, [currentProjectId, searchParams, router])
  

  const handleSelectionChange = (newSelection: Selection) => {
    setSelection(newSelection)
    if (newSelection) {
      router.push(`/projects/results?projectId=${newSelection.projectId}&resultId=${newSelection.resultId}`)
    } else {
      const projectId = searchParams.get('projectId')
      if (projectId) {
        router.push(`/projects/results?projectId=${projectId}`)
      } else {
        router.push('/projects/results')
      }
    }
  }

  const selectedProjectId = searchParams.get('projectId')
  const projectIdToUse = selectedProjectId || currentProjectId
  const currentProject = projectIdToUse
    ? projects.find(p => p.id === projectIdToUse) || projects[0]
    : projects[0]

  const selectedResult = selection
    ? projects
        .find(p => p.id === selection.projectId)
        ?.results.find(r => r.id === selection.resultId)
    : null

  const selectedData: ApiResponse | null = selectedResult?.data ?? null
  const selectedResultTitle = selectedResult?.label ?? null

  const headerTitle = selectedResultTitle
    ? `Results for ${selectedResultTitle}`
    : currentProject?.name ?? 'No project'

  const projectResults = currentProject?.results || []

  // Compound selection state
  const [selectedCompoundIndex, setSelectedCompoundIndex] = useState<number | null>(null)
  const compounds: SimilarityResult[] = selectedData?.results || []
  const selectedCompound: SimilarityResult | null = 
    selectedCompoundIndex !== null && compounds[selectedCompoundIndex] !== undefined
      ? compounds[selectedCompoundIndex]
      : null

  // Auto-select first compound when data loads
  useEffect(() => {
    if (compounds.length > 0 && selectedCompoundIndex === null) {
      setSelectedCompoundIndex(0)
    } else if (compounds.length === 0) {
      setSelectedCompoundIndex(null)
    }
  }, [compounds.length, selectedCompoundIndex])

  const handleCompoundSelect = (index: number) => {
    setSelectedCompoundIndex(index)
  }

  const handlePreviousCompound = () => {
    if (selectedCompoundIndex !== null && selectedCompoundIndex > 0) {
      setSelectedCompoundIndex(selectedCompoundIndex - 1)
    }
  }

  const handleNextCompound = () => {
    if (selectedCompoundIndex !== null && selectedCompoundIndex < compounds.length - 1) {
      setSelectedCompoundIndex(selectedCompoundIndex + 1)
    }
  }

  const handleProjectChange = (projectId: string) => {
    setCurrentProjectId(projectId)
    if (typeof window !== 'undefined') {
      localStorage.setItem('adme-current-project-id', projectId)
    }
    const resultId = searchParams.get('resultId')
    if (resultId) {
      router.push(`/projects/results?projectId=${projectId}&resultId=${resultId}`)
    } else {
      router.push(`/projects/results?projectId=${projectId}`)
    }
  }

  return (
    <SidebarProvider>
      <ProjectSidebar
        projects={projects}
        currentProjectId={currentProjectId}
        onProjectChange={handleProjectChange}
        currentUser={{ name: 'User' }}
      />

      <SidebarInset>
        <div className="flex w-full flex-col h-screen">
          <Header headerTitle={headerTitle} />

          <main className="flex-1 overflow-hidden">
            {!selection && (
              <div className="max-w-6xl mx-auto p-4 overflow-auto h-full">
                <div className="mb-4">
                  <Button
                    variant="outline"
                    onClick={() => router.push('/projects')}
                  >
                    ← Back to Projects
                  </Button>
                </div>
                {projectResults.length === 0 ? (
                  <div className="text-center py-12">
                    <h1 className="text-2xl font-bold mb-4">No Results Yet</h1>
                    <p className="text-muted-foreground mb-6">
                      This project doesn't have any results yet. Create a new query to get started.
                    </p>
                    <Button onClick={() => router.push('/query')}>
                      Create New Query
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h1 className="text-2xl font-bold">All Results</h1>
                        <p className="text-muted-foreground mt-1">
                          {projectResults.length} result{projectResults.length !== 1 ? 's' : ''} in {currentProject?.name}
                        </p>
                      </div>
                      <Button onClick={() => router.push('/query')}>
                        Create New Query
                      </Button>
                    </div>
                    <div className="grid gap-4">
                      {projectResults.map((result) => (
                        <div key={result.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="font-medium text-lg">{result.label}</h3>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleSelectionChange({
                                projectId: currentProject.id,
                                resultId: result.id
                              })}
                            >
                              View Details
                            </Button>
                          </div>
                          {result.data && result.data.results && result.data.results.length > 0 ? (
                            <div className="text-sm text-muted-foreground">
                              {result.data.results.length} result(s) found
                            </div>
                          ) : (
                            <div className="text-sm text-muted-foreground">
                              No data available
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {selection && selectedData && (
              <div className="flex flex-col h-full">
                {/* Header with back button and navigation */}
                <div className="border-b bg-white px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const projectId = searchParams.get('projectId')
                        if (projectId) {
                          router.push(`/projects/results?projectId=${projectId}`)
                        } else {
                          setSelection(null)
                        }
                      }}
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back
                    </Button>
                    <span className="text-sm font-medium">Results for</span>
                    {compounds.length > 0 && (
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handlePreviousCompound}
                          disabled={selectedCompoundIndex === null || selectedCompoundIndex === 0}
                          className="h-8 w-8 p-0"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleNextCompound}
                          disabled={selectedCompoundIndex === null || selectedCompoundIndex === compounds.length - 1}
                          className="h-8 w-8 p-0"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Split view: Compound list on left, ADMET on right */}
                <div className="flex flex-1 overflow-hidden">
                  {/* Left: Compound List */}
                  <div className="w-80 shrink-0">
                    <CompoundList
                      compounds={compounds}
                      selectedIndex={selectedCompoundIndex}
                      onSelect={handleCompoundSelect}
                    />
                  </div>

                  {/* Right: ADMET Properties */}
                  <div className="flex-1 overflow-hidden">
                    <Admet compound={selectedCompound} />
                  </div>
                </div>
              </div>
            )}

            {selection && !selectedData && (
              <div className="max-w-2xl mx-auto text-center py-12">
                <div className="mb-4">
                  <Button
                    variant="outline"
                    onClick={() => setSelection(null)}
                  >
                    ← Back to All Results
                  </Button>
                </div>
                <h1 className="text-2xl font-bold mb-4">No Data Available</h1>
                <p className="text-muted-foreground mb-6">
                  The selected result data could not be found.
                </p>
                <Button onClick={() => router.push('/query')}>
                  Create New Query
                </Button>
              </div>
            )}
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

export default function ProjectsResultsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    }>
      <ResultsContent />
    </Suspense>
  )
}

