'use client'
import React, { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import ProjectSidebar from '@/components/ProjectSidebar'
import ResultsTable from '@/components/ResultsTable'
import { Button } from '@/components/ui/button'
import type { Project, ApiResponse, Selection } from '@/types'
import Header from '@/components/Header'

function ResultsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Always start with default values to avoid hydration mismatch
  const [projects, setProjects] = useState<Project[]>([
    { id: 'p1', name: 'Project 1', results: [] },
  ])
  
  // Load from localStorage only after mount (client-side only)
  useEffect(() => {
    const storedProjects = localStorage.getItem('adme-projects')
    if (storedProjects) {
      try {
        const parsed = JSON.parse(storedProjects)
        setProjects(parsed)
      } catch {
        // Keep default
      }
    }
  }, [])

  // Initialize selection from URL params
  const [selection, setSelection] = useState<Selection>(() => {
    const projectId = searchParams.get('projectId')
    const resultId = searchParams.get('resultId')
    
    if (projectId && resultId) {
      return { projectId, resultId }
    }
    return null
  })

  // Update selection when URL params change
  useEffect(() => {
    const projectId = searchParams.get('projectId')
    const resultId = searchParams.get('resultId')
    
    if (projectId && resultId) {
      setSelection({ projectId, resultId })
    } else {
      setSelection(null)
    }
  }, [searchParams])
  

  // Update URL when selection changes
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

  // Get the selected project (from URL or first project)
  const selectedProjectId = searchParams.get('projectId')
  const currentProject = selectedProjectId
    ? projects.find(p => p.id === selectedProjectId) || projects[0]
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

  // Get all results from the selected project
  const projectResults = currentProject?.results || []

  return (
    <SidebarProvider>
      <ProjectSidebar
        projects={projects}
        selection={selection}
        onNewProject={() => {
          const id = `p_${Date.now()}`
          const newProjects = [...projects, { id, name: `Project ${projects.length + 1}`, results: [] }]
          setProjects(newProjects)
          if (typeof window !== 'undefined') {
            localStorage.setItem('adme-projects', JSON.stringify(newProjects))
          }
        }}
        onPinProject={() => {}}
        onNewQuery={() => {
          router.push('/query')
        }}
        onOpenResult={(pid, rid) => handleSelectionChange({ projectId: pid, resultId: rid })}
        currentUser={{ name: 'User' }}
      />

      <SidebarInset>
        <div className="flex w-full flex-col">
          <Header headerTitle={headerTitle} />

          <main className="flex-1 p-4 overflow-auto">
            {!selection && (
              <div className="max-w-6xl mx-auto">
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
              <div className="max-w-6xl mx-auto">
                <div className="mb-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      const projectId = searchParams.get('projectId')
                      if (projectId) {
                        router.push(`/projects/results?projectId=${projectId}`)
                      } else {
                        setSelection(null)
                      }
                    }}
                  >
                    ← Back to All Results
                  </Button>
                </div>
                <ResultsTable
                  results={selectedData.results}
                />
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

