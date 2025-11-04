import React, { useState } from 'react'
import { Button } from './ui/button'
import { Textarea } from './ui/textarea'

interface InputFormProps {
  smiles: string
  setSMILES: (smiles: string) => void
  handleClick: () => void | Promise<void>
  isLoading?: boolean
}

const InputForm = ({ smiles, setSMILES, handleClick, isLoading = false }: InputFormProps) => {
  const [error, setError] = useState<string>('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!smiles.trim()) {
      setError('Please enter a SMILES string')
      return
    }

    try {
      await handleClick()
    } catch (err) {
      setError('An error occurred. Please try again.')
      console.error(err)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Enter (but allow Shift+Enter for new lines)
    if (e.key === 'Enter' && !e.shiftKey && !isLoading) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="flex flex-col gap-2">
        <Textarea
          placeholder="Enter SMILES string (e.g., CCO for ethanol)"
          value={smiles}
          onChange={(e) => {
            setSMILES(e.target.value)
            if (error) setError('')
          }}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          className="min-h-[100px] resize-none"
        />
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
      </div>
      <Button 
        type="submit" 
        disabled={isLoading || !smiles.trim()}
        className="w-full sm:w-auto"
      >
        {isLoading ? 'Searching...' : 'Submit'}
      </Button>
    </form>
  )
}

export default InputForm