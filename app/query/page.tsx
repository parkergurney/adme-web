'use client'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import ProjectSidebar from '@/components/ProjectSidebar'
import InputForm from '@/components/InputForm'
import type { Project, ProjectResult, ApiResponse } from '@/types'
import Header from '@/components/Header'

export default function QueryPage() {
  const router = useRouter()
  const [smiles, setSMILES] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Always start with default values to avoid hydration mismatch
  const [projects, setProjects] = useState<Project[]>([
    { id: 'p1', name: 'Project 1', results: [] },
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
			console.log(response)
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: `API error ${response.status}` }))
        throw new Error(errorData.error || `API error ${response.status}`)
      }

      const batchResponse = await response.json()
      const batch: ApiResponse[] = batchResponse.results || []

      if (batchResponse.errors && batchResponse.errors.length > 0) {
        const errorMessages = batchResponse.errors.map((e: any) => `${e.smiles}: ${e.error}`).join(', ')
        setError(`Some queries failed: ${errorMessages}`)
      }

      const newResults: ProjectResult[] = lines.map((s, i) => {
        const id = `r_${Date.now()}_${i}`
        return {
          id,
          label: s,
          data: batch[i] || { results: [] }
        }
      })

      // Add results to the current project
      const updatedProjects = [...projects]
      const idx = updatedProjects.findIndex(p => p.id === currentProject.id)
      if (idx >= 0) {
        const existingResults = updatedProjects[idx].results || []
        updatedProjects[idx] = { 
          ...updatedProjects[idx], 
          results: [...newResults, ...existingResults] 
        }
      }
      setProjects(updatedProjects)

      // Save projects to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('adme-projects', JSON.stringify(updatedProjects))
      }

      // Navigate to results page with the first result selected
      const firstResultId = newResults[0].id
      setIsLoading(false)
      router.push(`/projects/results?projectId=${currentProject.id}&resultId=${firstResultId}`)
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
        onOpenResult={(pid, rid) => {
          router.push(`/results?projectId=${pid}&resultId=${rid}`)
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

