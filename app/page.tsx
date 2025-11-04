'use client'
import React from 'react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
	Table,
	TableBody,
	TableCaption,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table"

type SimilarityResult = {
	index: number
	SMILES_ISO: string
	similarity: number
	PUBCHEM_SID?: string
	PUBCHEM_CID?: string
	Permeability?: string
	Outcome?: string
}

type ApiResponse = {
	results: SimilarityResult[]
}
const page = () => {
	const [smiles, setSMILES] = useState('')
	const [data, setData] = useState<ApiResponse | null>(null)

	const handleClick = async () => {
		const response = await fetch('/api/run-python', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ smiles }),
		})
		const json: ApiResponse = await response.json()
		setData(json)
		console.log(json)
	}
	return (
		<div className="flex flex-col items-center h-screen p-4">
			<div className="max-w-md w-full h-1/2 flex flex-col gap-2 items-center justify-center">
				<Textarea placeholder="Enter SMILES" value={smiles} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setSMILES(e.target.value)} />
				<Button onClick={handleClick}>Submit</Button>
			</div>
			<div className="h-1/2">
				{data ? (
					<div className="flex flex-col gap-2 w-full h-full">
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
								{data.results.map((result) => (
									<TableRow key={result.index}>
									<TableCell>{result.SMILES_ISO}</TableCell>
									<TableCell>{result.similarity}</TableCell>
									<TableCell>{result.Permeability}</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>
				) : (
					<div>
						<h1 className="text-2xl font-bold">Enter a SMILES string to find similar molecules</h1>
					</div>
				)}
			</div>
		</div>
	)
}

export default page