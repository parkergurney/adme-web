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

  const [projects, setProjects] = useState<Project[]>([
    { id: 'p1', name: 'Project 1', results: [] },
  ])
  const [currentProjectId, setCurrentProjectId] = useState<string | undefined>(undefined)
  
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
  }, [])

  const currentProject = currentProjectId
    ? projects.find(p => p.id === currentProjectId) || projects[0]
    : projects[0]

  const handleProjectChange = (projectId: string) => {
    setCurrentProjectId(projectId)
    if (typeof window !== 'undefined') {
      localStorage.setItem('adme-current-project-id', projectId)
    }
  }

  // const handleBatchSubmit = async () => {
  //   const lines = smiles
  //     .split('\n')
  //     .map(s => s.trim())
  //     .filter(Boolean)

  //   if (lines.length === 0) return

  //   setIsLoading(true)
  //   setError(null)

  //   try {
  //     const response = await fetch('/api/run-python', {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify({ smiles: lines }),
  //     })
	// 		console.log(response)
  //     if (!response.ok) {
  //       const errorData = await response.json().catch(() => ({ error: `API error ${response.status}` }))
  //       throw new Error(errorData.error || `API error ${response.status}`)
  //     }

  //     const batchResponse = await response.json()
  //     const batch: ApiResponse[] = batchResponse.results || []

  //     if (batchResponse.errors && batchResponse.errors.length > 0) {
  //       const errorMessages = batchResponse.errors.map((e: any) => `${e.smiles}: ${e.error}`).join(', ')
  //       setError(`Some queries failed: ${errorMessages}`)
  //     }

  //     const newResults: ProjectResult[] = lines.map((s, i) => {
  //       const id = `r_${Date.now()}_${i}`
  //       return {
  //         id,
  //         label: s,
  //         data: batch[i] || { results: [] }
  //       }
  //     })

  //     const updatedProjects = [...projects]
  //     const idx = updatedProjects.findIndex(p => p.id === currentProject.id)
  //     if (idx >= 0) {
  //       const existingResults = updatedProjects[idx].results || []
  //       updatedProjects[idx] = { 
  //         ...updatedProjects[idx], 
  //         results: [...newResults, ...existingResults] 
  //       }
  //     }
  //     setProjects(updatedProjects)

  //     if (typeof window !== 'undefined') {
  //       localStorage.setItem('adme-projects', JSON.stringify(updatedProjects))
  //     }

  //     const firstResultId = newResults[0].id
  //     setIsLoading(false)
  //     router.push(`/projects/results?projectId=${currentProject.id}&resultId=${firstResultId}`)
  //   } catch (e) {
  //     setError(e instanceof Error ? e.message : 'Something went wrong')
  //     setIsLoading(false)
  //   }
  // }


  const handleBatchSubmit = () => {
  const lines = smiles
    .split('\n')
    .map(s => s.trim())
    .filter(Boolean)

  if (lines.length === 0) {
    setError('Please enter at least one SMILES string.')
    return
  }

  setError(null)

  // Redirect to the new results page
  if (typeof window !== 'undefined') {
    localStorage.setItem('last-submitted-smiles', JSON.stringify(lines))
  }

  router.push('/projects/results')
  
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

