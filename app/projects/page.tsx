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
  const [isCreatingProject, setIsCreatingProject] = useState(false)
  const [newProjectName, setNewProjectName] = useState('')
  
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

  const handleCreateProject = () => {
    if (!newProjectName.trim()) return
    
    const newProject: Project = {
      id: `p${Date.now()}`,
      name: newProjectName,
      results: []
    }
    
    const updatedProjects = [...projects, newProject]
    setProjects(updatedProjects)
    localStorage.setItem('adme-projects', JSON.stringify(updatedProjects))
    localStorage.setItem('adme-current-project-id', newProject.id)
    
    setNewProjectName('')
    setIsCreatingProject(false)
    
    // Redirect to query page
    router.push('/query')
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
                </div>
              </div>

              {projects.length === 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                  <div
                    className="aspect-square border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer hover:opacity-80 active:scale-95 transition-all"
                    style={{ backgroundColor: '#EEEEEE', borderColor: '#EEEEEE' }}
                    onClick={() => setIsCreatingProject(true)}
                  >
                    <span className="text-4xl text-white">+</span>
                  </div>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                  {projects.map((project) => {
                    const resultCount = project.results?.length || 0
                    return (
                      <Card key={project.id} className="aspect-square hover:shadow-lg transition-shadow cursor-pointer">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">{project.name}</CardTitle>
                          </div>
                          <CardDescription>
                            {resultCount} result{resultCount !== 1 ? 's' : ''}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => {
                              if (resultCount > 0) {
                                router.push(`/projects/results?projectId=${project.id}`)
                              } else {
                                router.push('/query')
                              }
                            }}
                          >
                            {resultCount > 0 ? 'View Results' : 'Create Query'}
                          </Button>
                        </CardContent>
                      </Card>
                    )
                  })}
                  <div
                    className="aspect-square border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer hover:opacity-80 active:scale-95 transition-all"
                    style={{ backgroundColor: '#C8C8C8', borderColor: '#C8C8C8' }}
                    onClick={() => setIsCreatingProject(true)}
                  >
                    <span className="text-4xl text-white">+</span>
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>
      </SidebarInset>

      {/* Create Project Dialog */}
      {isCreatingProject && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setIsCreatingProject(false)}>
          <div className="bg-white rounded-lg p-6 w-96 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-semibold mb-4">Name of Project</h2>
            <input
              type="text"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleCreateProject()
                }
              }}
              placeholder="Enter project name..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4 text-base"
              autoFocus
            />
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setIsCreatingProject(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateProject} disabled={!newProjectName.trim()}>
                Create
              </Button>
            </div>
          </div>
        </div>
      )}
    </SidebarProvider>
  )
}