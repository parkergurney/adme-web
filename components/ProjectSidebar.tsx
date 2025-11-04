import React, { useState, useEffect } from "react"
import {
	Sidebar as ShadSidebar,
	SidebarHeader,
	SidebarContent,
	SidebarFooter,
	SidebarMenu,
	SidebarMenuItem,
	SidebarMenuButton,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarMenuSub,
	SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Folder, Search, ChevronRight, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Project, Query, QueryResult, Selection } from "@/types"

export type ProjectSidebarProps = {
	projects: Project[]
	selection?: Selection
	onNewProject?: () => void
	onPinProject?: () => void
	onNewQuery?: (projectId: string) => void
	onOpenResult?: (projectId: string, queryId: string, resultId: string) => void
	currentUser?: { name: string; avatarUrl?: string }
}

const EmptyState = () => (
	<div className="text-sm text-muted-foreground px-2 py-1.5">No items</div>
)

export default function ProjectSidebar({
	projects,
	selection,
	onNewProject,
	onPinProject,
	onNewQuery,
	onOpenResult,
	currentUser,
}: ProjectSidebarProps) {
	// Track open state for projects and queries to avoid hydration issues
	const [openProjects, setOpenProjects] = useState<Set<string>>(new Set())
	const [openQueries, setOpenQueries] = useState<Set<string>>(new Set())
	
	// Initialize open state after mount to avoid hydration mismatch
	useEffect(() => {
		const projectIds = new Set(projects.map(p => p.id))
		setOpenProjects(projectIds)
		const queryIds = new Set(projects.flatMap(p => p.queries.map(q => q.id)))
		setOpenQueries(queryIds)
	}, [projects])

	return (

		<ShadSidebar variant="inset">
			<SidebarHeader className="px-4 py-3">
				<div className="flex items-center gap-2">
					<Folder />
					<span className="font-semibold tracking-tight">ADME</span>
				</div>
			</SidebarHeader>

			<SidebarContent>

				{/* Projects */}
				<SidebarGroup>
					<SidebarGroupLabel>Projects</SidebarGroupLabel>
					<SidebarGroupContent>
						{projects.length === 0 ? (
							<EmptyState />
						) : (
							<SidebarMenu>
								{projects.map((project) => {
									const isProjectOpen = openProjects.has(project.id)
									return (
										<Collapsible 
											key={project.id} 
											open={isProjectOpen}
											onOpenChange={(open) => {
												setOpenProjects(prev => {
													const next = new Set(prev)
													if (open) {
														next.add(project.id)
													} else {
														next.delete(project.id)
													}
													return next
												})
											}}
											className="group/project"
										>
											<SidebarMenuItem className=''>
												{/* Level 1: projects */}
												<CollapsibleTrigger asChild>
													<SidebarMenuButton>
														<Folder />
														<span className="truncate">{project.name}</span>
														<ChevronRight className="ml-auto size-4 transition group-data-[state=open]/project:rotate-90" />
													</SidebarMenuButton>
												</CollapsibleTrigger>

												<CollapsibleContent>
													{/* Level 2: queries under this project */}
													<SidebarMenuSub className="">
														{project.queries.map((q) => {
															const isQueryOpen = openQueries.has(q.id)
															return (
																<SidebarMenuSubItem key={q.id} className="p-0">
																	<Collapsible 
																		open={isQueryOpen}
																		onOpenChange={(open) => {
																			setOpenQueries(prev => {
																				const next = new Set(prev)
																				if (open) {
																					next.add(q.id)
																				} else {
																					next.delete(q.id)
																				}
																				return next
																			})
																		}}
																		className="group/query w-full"
																	>
																		{/* Query row as the trigger */}
																		<CollapsibleTrigger asChild>
																			<SidebarMenuButton className="w-full">
																				<Search />
																				<span className="truncate">{q.title}</span>
																				<ChevronRight className="ml-auto size-3.5 transition group-data-[state=open]/query:rotate-90" />
																			</SidebarMenuButton>
																		</CollapsibleTrigger>

																		{/* Level 3: results under this query */}
																		<CollapsibleContent>
																			<SidebarMenuSub>
																				{q.results.length === 0 ? (
																					<SidebarMenuSubItem>
																						<span className="text-xs text-muted-foreground">No results</span>
																					</SidebarMenuSubItem>
																				) : (
																					q.results.map((r) => (
																						<SidebarMenuSubItem key={r.id}>
																							<Button
																								variant="ghost"
																								className={cn(
																									"w-full justify-start h-7 px-2 text-xs min-w-0",
																									selection?.projectId === project.id && 
																									selection?.queryId === q.id && 
																									selection?.resultId === r.id &&
																									"bg-sidebar-accent text-sidebar-accent-foreground font-medium"
																								)}
																								onClick={() => onOpenResult?.(project.id, q.id, r.id)}
																							>
																								<span className="truncate">{r.label}</span>
																							</Button>
																						</SidebarMenuSubItem>
																					))
																				)}
																			</SidebarMenuSub>
																		</CollapsibleContent>
																	</Collapsible>
																</SidebarMenuSubItem>
															)
														})}

														{/* Add query button lives with the queries */}
														<SidebarMenuSubItem>
															<Button
																variant="ghost"
																className="w-full justify-start font-normal"
																onClick={() => onNewQuery?.(project.id)}
															>
																<Plus />
																New Query
															</Button>
														</SidebarMenuSubItem>
													</SidebarMenuSub>
												</CollapsibleContent>
											</SidebarMenuItem>
											<SidebarMenuItem>
												<Button
													variant="ghost"
													className="w-full justify-start font-normal"
													onClick={() => onNewQuery?.(project.id)}
												>
													<Plus />
													New Project
												</Button>
											</SidebarMenuItem>
										</Collapsible>
									)
								})}
							</SidebarMenu>
						)}
					</SidebarGroupContent>
				</SidebarGroup>


				<Separator />
			</SidebarContent>

			<SidebarFooter className="px-4 py-3">
				<div className="flex items-center gap-3">
					<Avatar className="size-7">
						{currentUser?.avatarUrl ? (
							<AvatarImage src={currentUser.avatarUrl} alt={currentUser.name} />
						) : (
							<AvatarFallback>{currentUser?.name?.[0] ?? "U"}</AvatarFallback>
						)}
					</Avatar>
					<div className="flex flex-col leading-tight">
						<span className="text-sm font-medium">{currentUser?.name ?? "User"}</span>
						<span className="text-xs text-muted-foreground">Signed in</span>
					</div>
				</div>
			</SidebarFooter>
		</ShadSidebar>
	)
}