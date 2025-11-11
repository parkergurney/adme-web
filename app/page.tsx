'use client'
import React, { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar'
import ProjectSidebar from '@/components/ProjectSidebar'
import ResultsTable from '@/components/ResultsTable'
import { Button } from '@/components/ui/button'
import type { Project, ApiResponse, Selection } from '@/types'
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
  }, [searchParams])
  

  const handleSelectionChange = (newSelection: Selection) => {
    setSelection(newSelection)
    if (newSelection) {
      router.push(`/?projectId=${newSelection.projectId}&resultId=${newSelection.resultId}`)
    }
  }

  const currentProject = currentProjectId
    ? projects.find(p => p.id === currentProjectId) || projects[0]
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

  const handleProjectChange = (projectId: string) => {
    setCurrentProjectId(projectId)
    if (typeof window !== 'undefined') {
      localStorage.setItem('adme-current-project-id', projectId)
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
        <div className="flex w-full flex-col">
					<Header headerTitle={headerTitle} />

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
