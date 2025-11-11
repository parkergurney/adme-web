import React from "react"
import { useRouter } from "next/navigation"
import {
	Sidebar as ShadSidebar,
	SidebarHeader,
	SidebarContent,
	SidebarFooter,
	SidebarMenuItem,
	SidebarMenuButton,
	SidebarMenu,
} from "@/components/ui/sidebar"
import Image from "next/image"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Folder, Settings, Pencil, List, ChevronDown } from "lucide-react"
import type { Project } from "@/types"

// Fallback projects if none are provided
const fallbackProjects: Project[] = [
	{ id: 'p1', name: 'Project 1', results: [] },
	{ id: 'p2', name: 'Project 2', results: [] },
	{ id: 'p3', name: 'Project 3', results: [] },
]

const items = [
	{
		label: 'Query Results',
		icon: List,
		href: '/projects/results',
	},
	{
		label: 'Create New Query',
		icon: Pencil,
		href: '/query',
	},
	{
		label: 'Settings',
		icon: Settings,
		href: '#',
	},
]

interface ProjectSidebarProps {
	projects?: Project[]
	currentProjectId?: string
	onProjectChange?: (projectId: string) => void
	currentUser?: { name: string }
}

export default function ProjectSidebar({
	projects,
	currentProjectId,
	onProjectChange,
	currentUser,
}: ProjectSidebarProps) {
	const router = useRouter()
	// Use projects from props, fallback to hardcoded projects if none provided
	const displayProjects = projects && projects.length > 0 ? projects : fallbackProjects
	// Find current project by ID, or default to first project
	const currentProject = currentProjectId
		? displayProjects.find(p => p.id === currentProjectId) || displayProjects[0]
		: displayProjects[0]
	
	const handleProjectSelect = (projectId: string) => {
		if (onProjectChange) {
			onProjectChange(projectId)
		}
	}

	return (
		<ShadSidebar variant="inset">
			<SidebarHeader className="px-4 py-3 pb-10">
				<div className="flex items-center gap-2">
					<Image src="/logo.svg" alt="Athena" width={20} height={20} />
					<span className="font-semibold tracking-tight">Athena</span>
				</div>
			</SidebarHeader>

			<SidebarContent>
				<SidebarMenu className='gap-y-2 px-2'>
					<SidebarMenuItem>
						<SidebarMenuButton onClick={() => router.push('/projects')}>
							<Folder />
							<span>All Projects</span>
						</SidebarMenuButton>
					</SidebarMenuItem>

					<Separator />

					{/* Project switcher dropdown */}
					<SidebarMenuItem>
						<DropdownMenu modal={false}>
							<DropdownMenuTrigger asChild>
								<SidebarMenuButton className="w-full">
									<span className="truncate">
										{currentProject?.name ?? "Select a project"}
									</span>
									<ChevronDown className="ml-auto size-4" />
								</SidebarMenuButton>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="start" className="w-56" sideOffset={4}>
								{displayProjects.length === 0 ? (
									<DropdownMenuItem disabled>No projects</DropdownMenuItem>
								) : (
									displayProjects.map(p => (
										<DropdownMenuItem
											key={p.id}
											onClick={() => handleProjectSelect(p.id)}
										>
											{p.name}
										</DropdownMenuItem>
									))
								)}
							</DropdownMenuContent>
						</DropdownMenu>
					</SidebarMenuItem>

					{/* Navigation items */}
					{items.map((item) => (
						<SidebarMenuItem key={item.label}>
							<SidebarMenuButton onClick={() => router.push(item.href)}>
								<item.icon />
								<span>{item.label}</span>
							</SidebarMenuButton>
						</SidebarMenuItem>
					))}
				</SidebarMenu>
			</SidebarContent>

			<SidebarFooter className="px-4 py-3">
				<div className="flex items-center gap-3">
					<Avatar className="size-7">
						<AvatarFallback>
							{currentUser?.name?.[0]?.toUpperCase() || 'U'}
						</AvatarFallback>
					</Avatar>
					<div className="flex flex-col leading-tight">
						<span className="text-sm font-medium">{currentUser?.name || 'User'}</span>
						<span className="text-xs text-muted-foreground">Signed in</span>
					</div>
				</div>
			</SidebarFooter>
		</ShadSidebar>
	)
}