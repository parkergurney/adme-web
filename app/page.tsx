'use client'
import React, { useMemo, useState } from 'react'
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar'
import ProjectSidebar from '@/components/ProjectSidebar'
import InputForm from '@/components/InputForm'
import ResultsTable from '@/components/ResultsTable'
import type { Project, Query, QueryResult, ApiResponse, Selection } from '@/types'

export default function Page() {
  const [smiles, setSMILES] = useState('')
  const [projects, setProjects] = useState<Project[]>([
    { id: 'p1', name: 'Project 1', queries: [] },
  ])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selection, setSelection] = useState<Selection>(null)

  // Store tables for each result id that lives in the sidebar
  const [resultsByResultId, setResultsByResultId] = useState<Record<string, ApiResponse>>({})

  const currentProject = projects[0]

  const nextQueryTitle = useMemo(() => {
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
      setProjects(prev => {
        const copy = [...prev]
        const idx = copy.findIndex(p => p.id === currentProject.id)
        if (idx >= 0) {
          copy[idx] = { ...copy[idx], queries: [newQuery, ...copy[idx].queries] }
        }
        return copy
      })

      // Save tables and update selection to the first result of this query
      setResultsByResultId(prev => ({ ...prev, ...newMap }))
      setSelection({ projectId: currentProject.id, queryId: newQuery.id, resultId: newResults[0].id })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  // Data for the currently selected result
  const selectedData: ApiResponse | null = selection
    ? resultsByResultId[selection.resultId] ?? null
    : null

  return (
    <SidebarProvider>
      <ProjectSidebar
        projects={projects}
        onNewProject={() => {
          const id = `p_${Date.now()}`
          setProjects(prev => [...prev, { id, name: `Project ${prev.length + 1}`, queries: [] }])
        }}
        onPinProject={() => {}}
        onNewQuery={() => {}}
        onOpenResult={(pid, qid, rid) => setSelection({ projectId: pid, queryId: qid, resultId: rid })}
        currentUser={{ name: 'User' }}
      />

      <SidebarInset>
        <div className="flex min-h-screen w-full flex-col">
          <header className="flex h-12 items-center gap-2 border-b px-4">
            <SidebarTrigger />
            <span className="text-sm font-medium">{currentProject?.name ?? 'No project'}</span>
          </header>

          <main className="flex-1 p-4 overflow-auto">
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

            <div className="mt-6">
              {isLoading && (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  <p className="text-sm text-muted-foreground">Running batch</p>
                </div>
              )}

              {!isLoading && selection && selectedData && (
                <ResultsTable
                  results={selectedData.results}
                  title={`Results for ${
                    projects
                      .find(p => p.id === selection.projectId)
                      ?.queries.find(q => q.id === selection.queryId)
                      ?.results.find(r => r.id === selection.resultId)?.label
                  }`}
                />
              )}

              {!isLoading && !selection && (
                <h1 className="text-2xl font-bold">
                  Submit a batch to create a query, then pick a result in the sidebar
                </h1>
              )}
            </div>
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
