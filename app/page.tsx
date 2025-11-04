'use client'
import React, { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar'
import ProjectSidebar from '@/components/ProjectSidebar'
import ResultsTable from '@/components/ResultsTable'
import { Button } from '@/components/ui/button'
import type { Project, ApiResponse, Selection } from '@/types'

function ResultsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Always start with default values to avoid hydration mismatch
  const [projects, setProjects] = useState<Project[]>([
    { id: 'p1', name: 'Project 1', queries: [] },
  ])

  const [resultsByResultId, setResultsByResultId] = useState<Record<string, ApiResponse>>({})
  
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
    
    const storedResults = localStorage.getItem('adme-results')
    if (storedResults) {
      try {
        const parsed = JSON.parse(storedResults)
        setResultsByResultId(parsed)
      } catch {
        // Keep default
      }
    }
  }, [])

  // Initialize selection from URL params
  const [selection, setSelection] = useState<Selection>(() => {
    const projectId = searchParams.get('projectId')
    const queryId = searchParams.get('queryId')
    const resultId = searchParams.get('resultId')
    
    if (projectId && queryId && resultId) {
      return { projectId, queryId, resultId }
    }
    return null
  })

  // Update selection when URL params change
  useEffect(() => {
    const projectId = searchParams.get('projectId')
    const queryId = searchParams.get('queryId')
    const resultId = searchParams.get('resultId')
    
    if (projectId && queryId && resultId) {
      setSelection({ projectId, queryId, resultId })
    } else {
      setSelection(null)
    }
  }, [searchParams])
  

  // Update URL when selection changes
  const handleSelectionChange = (newSelection: Selection) => {
    setSelection(newSelection)
    if (newSelection) {
      router.push(`/?projectId=${newSelection.projectId}&queryId=${newSelection.queryId}&resultId=${newSelection.resultId}`)
    }
  }

  // Data for the currently selected result
  const selectedData: ApiResponse | null = selection
    ? resultsByResultId[selection.resultId] ?? null
    : null

  // Get the title for the selected result
  const selectedResultTitle = selection
    ? projects
        .find(p => p.id === selection.projectId)
        ?.queries.find(q => q.id === selection.queryId)
        ?.results.find(r => r.id === selection.resultId)?.label
    : null

  const currentProject = projects[0]
  const headerTitle = selectedResultTitle
    ? `Results for ${selectedResultTitle}`
    : currentProject?.name ?? 'No project'

  return (
    <SidebarProvider>
      <ProjectSidebar
        projects={projects}
        selection={selection}
        onNewProject={() => {
          const id = `p_${Date.now()}`
          const newProjects = [...projects, { id, name: `Project ${projects.length + 1}`, queries: [] }]
          setProjects(newProjects)
          if (typeof window !== 'undefined') {
            localStorage.setItem('adme-projects', JSON.stringify(newProjects))
          }
        }}
        onPinProject={() => {}}
        onNewQuery={() => {
          router.push('/query')
        }}
        onOpenResult={(pid, qid, rid) => handleSelectionChange({ projectId: pid, queryId: qid, resultId: rid })}
        currentUser={{ name: 'User' }}
      />

      <SidebarInset>
        <div className="flex w-full flex-col">
          <header className="flex h-12 items-center gap-2 border-b px-4">
            <SidebarTrigger />
            <span className="text-sm font-medium">{headerTitle}</span>
          </header>

          <main className="flex-1 p-4 overflow-auto">
            {!selection && (
              <div className="max-w-2xl mx-auto text-center py-12">
                <h1 className="text-2xl font-bold mb-4">No Results Selected</h1>
                <p className="text-muted-foreground mb-6">
                  Select a result from the sidebar to view its data, or create a new query.
                </p>
                <Button onClick={() => router.push('/query')}>
                  Create New Query
                </Button>
              </div>
            )}

            {selection && selectedData && (
              <div className="max-w-6xl mx-auto">
                <ResultsTable
                  results={selectedData.results}
                />
              </div>
            )}

            {selection && !selectedData && (
              <div className="max-w-2xl mx-auto text-center py-12">
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

export default function ResultsPage() {
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
