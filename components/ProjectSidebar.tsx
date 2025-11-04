import React from "react"
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
import { Folder, Home, Pin, Search, ChevronRight, Plus } from "lucide-react"
import type { Project, Query, QueryResult } from "@/app/page"

export type ProjectSidebarProps = {
	projects: Project[]
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
	onNewProject,
	onPinProject,
	onNewQuery,
	onOpenResult,
	currentUser,
}: ProjectSidebarProps) {
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
								{projects.map((project) => (
									<Collapsible key={project.id} defaultOpen className="group/project">
										<SidebarMenuItem>
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
												<SidebarMenuSub>
													{project.queries.map((q) => (
														<SidebarMenuSubItem key={q.id} className="p-0">
															<Collapsible defaultOpen className="group/query w-full">
																{/* Query row as the trigger */}
																<CollapsibleTrigger asChild>
																	<SidebarMenuButton size="sm" className="w-full">
																		<Search className="size-3.5" />
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
																						className="w-full justify-start h-7 px-2 text-xs"
																						onClick={() => onOpenResult?.(project.id, q.id, r.id)}
																					>
																						{r.label}
																					</Button>
																				</SidebarMenuSubItem>
																			))
																		)}
																	</SidebarMenuSub>
																</CollapsibleContent>
															</Collapsible>
														</SidebarMenuSubItem>
													))}

													{/* Add query button lives with the queries */}
													<SidebarMenuSubItem>
														<Button
															variant="ghost"
															size="sm"
															className="w-full justify-start"
															onClick={() => onNewQuery?.(project.id)}
														>
															<Plus className="size-4 mr-2" />
															New Query
														</Button>
													</SidebarMenuSubItem>
												</SidebarMenuSub>
											</CollapsibleContent>
										</SidebarMenuItem>
									</Collapsible>
								))}
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