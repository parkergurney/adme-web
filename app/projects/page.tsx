'use client'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import ProjectSidebar from '@/components/ProjectSidebar'
import { Button } from '@/components/ui/button'
import type { Project } from '@/types'
import Header from '@/components/Header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function ProjectsPage() {
  const router = useRouter()
  
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
      }
    }
    
    const storedCurrentProjectId = localStorage.getItem('adme-current-project-id')
    if (storedCurrentProjectId) {
      setCurrentProjectId(storedCurrentProjectId)
    } else if (projects.length > 0) {
      setCurrentProjectId(projects[0].id)
    }
  }, [])

  const totalResults = projects.reduce((sum, p) => sum + (p.results?.length || 0), 0)

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
        <div className="flex h-full w-full flex-col">
          <Header headerTitle="Projects Overview" />

          <main className="flex-1 p-4 overflow-auto">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-bold">All Projects</h1>
                  <p className="text-muted-foreground mt-1">
                    {projects.length} project{projects.length !== 1 ? 's' : ''} • {totalResults} total result{totalResults !== 1 ? 's' : ''}
                  </p>
                </div>
                <Button onClick={() => router.push('/query')}>
                  Create New Query
                </Button>
              </div>

              {projects.length === 0 ? (
                <div className="text-center py-12">
                  <h2 className="text-2xl font-bold mb-4">No Projects Yet</h2>
                  <p className="text-muted-foreground mb-6">
                    Create your first project and start adding queries.
                  </p>
                  <Button onClick={() => router.push('/query')}>
                    Create New Query
                  </Button>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {projects.map((project) => {
                    const resultCount = project.results?.length || 0
                    return (
                      <Card key={project.id} className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle>{project.name}</CardTitle>
                            {project.pinned && (
                              <span className="text-xs text-muted-foreground">Pinned</span>
                            )}
                          </div>
                          <CardDescription>
                            {resultCount} result{resultCount !== 1 ? 's' : ''}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          {resultCount === 0 ? (
                            <p className="text-sm text-muted-foreground mb-4">
                              No results yet. Create a query to get started.
                            </p>
                          ) : (
                            <div className="space-y-2 mb-4">
                              {project.results?.slice(0, 3).map((result) => (
                                <div
                                  key={result.id}
                                  className="text-sm p-2 bg-muted rounded cursor-pointer hover:bg-muted/80 transition-colors"
                                  onClick={() => router.push(`/projects/results?projectId=${project.id}&resultId=${result.id}`)}
                                >
                                  <div className="font-medium truncate">{result.label}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {result.data?.results?.length || 0} matches
                                  </div>
                                </div>
                              ))}
                              {resultCount > 3 && (
                                <div className="text-sm text-muted-foreground text-center">
                                  +{resultCount - 3} more result{resultCount - 3 !== 1 ? 's' : ''}
                                </div>
                              )}
                            </div>
                          )}
                          <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => {
                              // Navigate to results page showing all results for this project
                              if (resultCount > 0) {
                                router.push(`/projects/results?projectId=${project.id}`)
                              } else {
                                router.push('/query')
                              }
                            }}
                          >
                            {resultCount > 0 ? 'View All Results' : 'Create Query'}
                          </Button>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}
            </div>
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

