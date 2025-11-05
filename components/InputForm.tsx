'use client'
import React, { useEffect, useRef, useState } from 'react'
import { Button } from './ui/button'
import { Textarea } from './ui/textarea'
import { Spinner } from './ui/spinner'

const PLACEHOLDER_ITEMS: readonly string[] = [
	'C1=CC=C2C(=C1)C(=O)C(=C(C2=O)SCCO)SCCO\nC1=CC(=C(C=C1[N+](=O)[O-])Cl)NC(=O)C2=C(C=CC(=C2)Cl)O\nCOC1=C(C(=CC(=C1)/C=C(\C#N)/C(=O)C2=CC(=C(C=C2)O)O)I)O',
	'C1=CC(=C(C=C1C2=CC(=O)C3=C(C=C(C=C3O2)O)O)O)O\nCOC(=O)NC1=NC2=C(N1)C=C(C=C2)C(=O)C3=CC=CC=C3\nC[C@@]12C3=CC=CC=C3C[C@@H](N1)C4=CC=CC=C24\nCC[C@@]1(C2=C(COC1=O)C(=O)N3CC4=CC5=CC=CC=C5N=C4C3=C2)O',
	'CCCOC1=CC2=C(C=C1)N=C(N2)NC(=O)OC',
	'CC(C)CCNC(=O)[C@H](CC(C)C)NC(=O)[C@@H]1[C@H](O1)C(=O)O\nCC[C@@H](CO)NC(=O)[C@H]1CN([C@@H]2CC3=CN(C4=CC=CC(=C34)C2=C1)C)C\nCC[C@H]1CN2CCC3=CC(=C(C=C3[C@@H]2C[C@@H]1C[C@@H]4C5=CC(=C(C=C5CCN4)OC)OC)OC)OC\nCN(CC1=CN=C2C(=N1)C(=NC(=N2)N)N)C3=CC=C(C=C3)C(=O)N[C@@H](CCC(=O)O)C(=O)O',
	'CC(C)CC1=CC=C(C=C1)O',
] as const

function useAnimatedPlaceholder(active: boolean) {
	const [text, setText] = useState('')
	const [cursor, setCursor] = useState(true)
	const [pIndex, setPIndex] = useState(0)
	const [phase, setPhase] = useState<string>('typing') // typing, pause, clear
	const [char, setChar] = useState(0)

	const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
	const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

	// Typing cycle
	useEffect(() => {
		if (!active) {
			setText('')
			setCursor(false)
			return
		}
		const current = PLACEHOLDER_ITEMS[pIndex]
		if (!current) return
		if (phase === 'typing') {
			if (char <= current.length) {
				timeoutRef.current = setTimeout(() => setChar(c => c + 1), 50)
				setText(current.slice(0, char))
			} else {
				setPhase('pause')
			}
		} else if (phase === 'pause') {
			timeoutRef.current = setTimeout(() => setPhase('clear'), 2000)
		} else if (phase === 'clear') {
			timeoutRef.current = setTimeout(() => {
				setText('')
				setChar(0)
				setPhase('typing')
				setPIndex(i => (i + 1) % PLACEHOLDER_ITEMS.length)
			}, 300)
		}
		return () => {
			if (timeoutRef.current) clearTimeout(timeoutRef.current)
		}
	}, [active, pIndex, phase, char])

	// Cursor blink
	useEffect(() => {
		if (!active) return
		intervalRef.current = setInterval(() => setCursor(c => !c), 530)
		return () => {
			if (intervalRef.current) clearInterval(intervalRef.current)
		}
	}, [active])
	return active ? text + (cursor ? '|' : '') : ''
}

interface InputFormProps {
	smiles: string
	setSMILES: (val: string) => void
	onSubmit: () => void | Promise<void>
	isLoading?: boolean
}

const InputForm = ({ smiles, setSMILES, onSubmit, isLoading = false }: InputFormProps) => {
	const isEmpty = !smiles.trim()
	const placeholder = useAnimatedPlaceholder(isEmpty && !isLoading)

	return (
		<div className="w-full flex flex-col gap-3">
			<Textarea
				placeholder={placeholder}
				value={smiles}
				onChange={(e) => setSMILES(e.target.value)}
				disabled={isLoading}
				className="h-80 placeholder:text-gray-400"
			/>
			<Button onClick={onSubmit} disabled={isLoading || !smiles.trim()}>
				{isLoading ? (
					<>
						<Spinner /> Running...
					</>
				) : (
					<>Submit</>
				)}
			</Button>
		</div>
	)
}

export default InputForm
