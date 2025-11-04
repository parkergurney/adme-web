'use client'
import React from 'react'
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
import InputForm from '@/components/InputForm'

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
	const [smiles, setSMILES] = useState('')
	const [data, setData] = useState<ApiResponse | null>(null)
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const projects = [
		{
			id: "1",
			name: "Project 1",
			queries: [
				{ id: "q1", title: "Query 1 Results", results: [] },
			],
		},
	]


	const handleClick = async () => {
		if (!smiles.trim()) {
			return
		}

		setIsLoading(true)
		setError(null)

		try {
			const response = await fetch('/api/run-python', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ smiles }),
			})

			if (!response.ok) {
				throw new Error(`API error: ${response.statusText}`)
			}

			const json: ApiResponse = await response.json()
			setData(json)
		} catch (err) {
			setError(err instanceof Error ? err.message : 'An error occurred')
			setData(null)
		} finally {
			setIsLoading(false)
		}
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
						<span className="text-sm font-medium">{projects[0].name}</span>
					</header>

					<main className="flex-1 p-4 overflow-auto">
						<div className="max-w-xl w-full flex flex-col gap-3">
							<InputForm 
								smiles={smiles} 
								setSMILES={setSMILES} 
								handleClick={handleClick}
								isLoading={isLoading}
							/>
						</div>

						{error && (
							<div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
								<p className="text-sm text-destructive">{error}</p>
							</div>
						)}

						<div className="mt-6">
							{isLoading ? (
								<div className="flex items-center gap-2">
									<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
									<p className="text-sm text-muted-foreground">Searching for similar molecules...</p>
								</div>
							) : data ? (
								<>
									<h1 className="text-2xl font-bold mb-4">Results ({data.results.length})</h1>
									<div className="border rounded-md overflow-auto">
										<Table>
											<TableHeader>
												<TableRow>
													<TableHead>Chemical Structure</TableHead>
													<TableHead>Tanimoto Score</TableHead>
													<TableHead>Permeability</TableHead>
												</TableRow>
											</TableHeader>
											<TableBody>
												{data.results.length > 0 ? (
													data.results.map((r) => (
														<TableRow key={r.index}>
															<TableCell className="font-mono text-sm">{r.SMILES_ISO}</TableCell>
															<TableCell>{r.similarity.toFixed(4)}</TableCell>
															<TableCell>{r.Permeability || 'N/A'}</TableCell>
														</TableRow>
													))
												) : (
													<TableRow>
														<TableCell colSpan={3} className="text-center text-muted-foreground">
															No results found
														</TableCell>
													</TableRow>
												)}
											</TableBody>
										</Table>
									</div>
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