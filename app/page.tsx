'use client'
import React, { useEffect } from 'react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar'
import ProjectSidebar from '@/components/ProjectSidebar'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table"

// Types
export type QueryResult = { id: string; label: string; onSelect?: (id: string) => void }
export type Query = { id: string; title: string; results: QueryResult[] }
export type Project = { id: string; name: string; queries: Query[]; pinned?: boolean }
type SimilarityResult = {
	index: number
	SMILES_ISO: string
	similarity: number
	PUBCHEM_SID?: string
	PUBCHEM_CID?: string
	Permeability?: string
	Outcome?: string
}
type ApiResponse = { results: SimilarityResult[] }

const page = () => {
	const [projects, setProjects] = useState<Project[]>([])
	const [smiles, setSMILES] = useState('')
	const [data, setData] = useState<ApiResponse | null>(null)


	useEffect(() => {
		setProjects([
			{
				id: "1",
				name: "Project 1",
				queries: [
					{ id: "q1", title: "Query 1 Results", results: [] },
				],
			},
		])
	}, [])

	const handleClick = async () => {
		const response = await fetch('/api/run-python', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ smiles }),
		})
		const json: ApiResponse = await response.json()
		setData(json)
	}

	return (
		<SidebarProvider>
			<ProjectSidebar
				projects={projects}
				onNewProject={() => {/* open create flow */ }}
				onPinProject={() => {/* pin current project */ }}
				onNewQuery={(pid) => {/* add query for pid */ }}
				onOpenResult={(pid, qid, rid) => {/* navigate to result */ }}
				currentUser={{ name: "User" }}
			/>
			<SidebarInset>
				<div className="flex h-full w-full flex-col">
					<header className="flex h-12 items-center gap-2 border-b px-4">
						<SidebarTrigger />
						<span className="text-sm font-medium">App</span>
					</header>

					<main className="flex-1 p-4">
						<div className="max-w-xl w-full flex flex-col gap-3">
							<Textarea
								placeholder="Enter SMILES"
								value={smiles}
								onChange={(e) => setSMILES(e.target.value)}
							/>
							<Button onClick={handleClick}>Submit</Button>
						</div>

						<div className="mt-6">
							{data ? (
								<>
									<h1 className="text-2xl font-bold">Results</h1>
									<Table>
										<TableHeader>
											<TableRow>
												<TableHead>Chemical Structure</TableHead>
												<TableHead>Tanimoto Score</TableHead>
												<TableHead>Permeability</TableHead>
											</TableRow>
										</TableHeader>
										<TableBody>
											{data.results.map((r) => (
												<TableRow key={r.index}>
													<TableCell>{r.SMILES_ISO}</TableCell>
													<TableCell>{r.similarity}</TableCell>
													<TableCell>{r.Permeability}</TableCell>
												</TableRow>
											))}
										</TableBody>
									</Table>
								</>
							) : (
								<h1 className="text-2xl font-bold">Enter a SMILES string to find similar molecules</h1>
							)}
						</div>
					</main>
				</div>
			</SidebarInset>
		</SidebarProvider>
	)
}

export default page