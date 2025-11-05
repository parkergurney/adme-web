'use client'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import ProjectSidebar from '@/components/ProjectSidebar'
import InputForm from '@/components/InputForm'
import type { Project, Query, QueryResult, ApiResponse } from '@/types'
import Header from '@/components/Header'
import { Spinner } from '@/components/ui/spinner'

export default function QueryPage() {
  const router = useRouter()
  const [smiles, setSMILES] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Always start with default values to avoid hydration mismatch
  const [projects, setProjects] = useState<Project[]>([
    { id: 'p1', name: 'Project 1', queries: [] },
  ])
  
  // Load from localStorage only after mount (client-side only)
  useEffect(() => {
    const stored = localStorage.getItem('adme-projects')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setProjects(parsed)
      } catch {
        // Keep default
      }
    }
  }, [])

  const currentProject = projects[0]

  const nextQueryTitle = React.useMemo(() => {
    const n = (currentProject?.queries.length ?? 0) + 1
    return `Query ${n}`
  }, [currentProject])

  const handleBatchSubmit = async () => {
    const lines = smiles
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean)

    if (lines.length === 0) return

    setIsLoading(true)
    setError(null)

    try {
      // Send all SMILES as an array in a single request
      const response = await fetch('/api/run-python', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ smiles: lines }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: `API error ${response.status}` }))
        throw new Error(errorData.error || `API error ${response.status}`)
      }

      const batchResponse = await response.json()
      const batch: ApiResponse[] = batchResponse.results || []

      // Handle errors if any
      if (batchResponse.errors && batchResponse.errors.length > 0) {
        const errorMessages = batchResponse.errors.map((e: any) => `${e.smiles}: ${e.error}`).join(', ')
        setError(`Some queries failed: ${errorMessages}`)
      }

      // Build query results for the sidebar
      const newResults: QueryResult[] = lines.map((s, i) => {
        const id = `r_${Date.now()}_${i}`
        return { id, label: s }
      })

      // Map resultId to its table data
      const newMap: Record<string, ApiResponse> = {}
      newResults.forEach((r, i) => {
        // Use the corresponding result from the batch, or empty result if index is out of bounds
        newMap[r.id] = batch[i] || { results: [] }
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
        <div className="flex h-full w-full flex-col">
					<Header headerTitle="Create New Query" />

          <main className="flex-1 p-4 overflow-auto">
            <div className="max-w-4xl mx-auto h-full">
              <h1 className="text-2xl font-bold mb-2">Enter chemical compounds</h1>
              <p className="text-sm text-muted-foreground mb-6">Use SMILES format, enter one compound per line for batch processing</p>
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
            </div>
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

