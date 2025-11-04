import React from 'react'
import { Button } from './ui/button'
import { Textarea } from './ui/textarea'

interface InputFormProps {
  smiles: string
  setSMILES: (smiles: string) => void
  onSubmit: () => void | Promise<void>
  isLoading?: boolean
}

const InputForm = ({ smiles, setSMILES, onSubmit, isLoading = false }: InputFormProps) => {
  return (
    <div className="max-w-xl w-full flex flex-col gap-3">
      <Textarea
        placeholder="Paste one SMILES per line"
        value={smiles}
        onChange={(e) => setSMILES(e.target.value)}
        disabled={isLoading}
        className="min-h-[100px] resize-none"
      />
      <Button onClick={onSubmit} disabled={isLoading || !smiles.trim()}>
        {isLoading ? 'Running' : 'Create Query from Batch'}
      </Button>
    </div>
  )
}

export default InputForm
