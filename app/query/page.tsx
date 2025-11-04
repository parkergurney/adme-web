'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import ProjectSidebar from '@/components/ProjectSidebar'
import InputForm from '@/components/InputForm'
import type { Project, Query, QueryResult, ApiResponse } from '@/types'

export default function QueryPage() {
  const router = useRouter()
  const [smiles, setSMILES] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load projects from localStorage or use default
  const [projects, setProjects] = useState<Project[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('adme-projects')
      if (stored) {
        try {
          return JSON.parse(stored)
        } catch {
          return [{ id: 'p1', name: 'Project 1', queries: [] }]
        }
      }
    }
    return [{ id: 'p1', name: 'Project 1', queries: [] }]
  })

  const currentProject = projects[0]

  const nextQueryTitle = React.useMemo(() => {
    const n = (currentProject?.queries.length ?? 0) + 1
    return `Query ${n}`
  }, [currentProject])

  const runSingle = async (one: string): Promise<ApiResponse> => {
    const response = await fetch('/api/run-python', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ smiles: one }),
    })
    if (!response.ok) throw new Error(`API error ${response.status}`)
    return response.json()
  }

  const handleBatchSubmit = async () => {
    const lines = smiles
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean)

    if (lines.length === 0) return

    setIsLoading(true)
    setError(null)

    try {
      // Run all inputs in parallel
      const batch = await Promise.all(lines.map(runSingle))

      // Build query results for the sidebar
      const newResults: QueryResult[] = lines.map((s, i) => {
        const id = `r_${Date.now()}_${i}`
        return { id, label: s }
      })

      // Map resultId to its table data
      const newMap: Record<string, ApiResponse> = {}
      newResults.forEach((r, i) => {
        newMap[r.id] = batch[i]
      })

      // Create the new query
      const newQuery: Query = {
        id: `q_${Date.now()}`,
        title: nextQueryTitle,
        results: newResults,
      }

      // Insert into the first project for now
      const updatedProjects = [...projects]
      const idx = updatedProjects.findIndex(p => p.id === currentProject.id)
      if (idx >= 0) {
        updatedProjects[idx] = { ...updatedProjects[idx], queries: [newQuery, ...updatedProjects[idx].queries] }
      }
      setProjects(updatedProjects)

      // Save projects and results to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('adme-projects', JSON.stringify(updatedProjects))
        
        // Load existing results map and merge
        const existingResults = localStorage.getItem('adme-results')
        const resultsMap: Record<string, ApiResponse> = existingResults ? JSON.parse(existingResults) : {}
        Object.assign(resultsMap, newMap)
        localStorage.setItem('adme-results', JSON.stringify(resultsMap))
      }

      // Navigate to results page with the first result selected
      const firstResultId = newResults[0].id
      router.push(`/?projectId=${currentProject.id}&queryId=${newQuery.id}&resultId=${firstResultId}`)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
      setIsLoading(false)
    }
  }

  return (
    <SidebarProvider>
      <ProjectSidebar
        projects={projects}
        selection={null}
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
        onOpenResult={(pid, qid, rid) => {
          router.push(`/?projectId=${pid}&queryId=${qid}&resultId=${rid}`)
        }}
        currentUser={{ name: 'User' }}
      />

      <SidebarInset>
        <div className="flex min-h-screen w-full flex-col">
          <header className="flex h-12 items-center gap-2 border-b px-4">
            <span className="text-sm font-medium">Create New Query</span>
          </header>

          <main className="flex-1 p-4 overflow-auto">
            <div className="max-w-2xl mx-auto">
              <h1 className="text-2xl font-bold mb-6">Enter SMILES Strings</h1>
              
              <InputForm
                smiles={smiles}
                setSMILES={setSMILES}
                onSubmit={handleBatchSubmit}
                isLoading={isLoading}
              />

              {error && (
                <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              {isLoading && (
                <div className="mt-6 flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  <p className="text-sm text-muted-foreground">Running batch query...</p>
                </div>
              )}
            </div>
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

