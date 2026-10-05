'use client'

import React, { useState, useRef, useEffect } from 'react'
import { cn, formatDate } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@radix-ui/react-scroll-area'
import { X, Trash2, Copy, Maximize2, Minimize2 } from 'lucide-react'

interface TerminalOutput {
  id: string
  type: 'stdout' | 'stderr' | 'system' | 'command'
  content: string
  timestamp: number
}

interface TerminalWindow extends Window {
  terminalAddOutput?: (type: TerminalOutput['type'], content: string) => void
}

export function Terminal() {
  const [outputs, setOutputs] = useState<TerminalOutput[]>([])
  const [input, setInput] = useState('')
  const [isMaximized, setIsMaximized] = useState(false)
  const terminalRef = useRef<HTMLDivElement>(null)

  const addOutput = (type: TerminalOutput['type'], content: string) => {
    setOutputs(prev => [...prev, {
      id: crypto.randomUUID(),
      type,
      content,
      timestamp: Date.now(),
    }])
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return
    
    addOutput('command', `$ ${input}`)
    addOutput('system', `Command not implemented: ${input}`)
    setInput('')
  }

  const clearTerminal = () => setOutputs([])

  const copyOutput = () => {
    const text = outputs.map(o => `
${formatDate(o.timestamp)} [${o.type}] ${o.content}`).join('')
    navigator.clipboard.writeText(text)
  }

  // Expose addOutput globally for tools to use
  useEffect(() => {
    const win = window as TerminalWindow
    win.terminalAddOutput = addOutput
    return () => { delete win.terminalAddOutput }
  }, [])

  return (
    <div className={cn(
      'flex flex-col border-t bg-black',
      isMaximized ? 'fixed inset-0 z-50 h-[calc(100vh-60px)]' : 'h-64'
    )}>
      {/* Terminal Header */}
      <div className="flex items-center justify-between px-2 py-1 border-b bg-gray-900">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-green-400">&gt;_ Terminal</span>
          {outputs.length > 0 && (
            <span className="text-xs text-gray-500">{outputs.length} lines</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={copyOutput} title="Copy output">
            <Copy className="w-3 h-3" />
          </Button>
          <Button variant="ghost" size="icon" onClick={clearTerminal} title="Clear">
            <Trash2 className="w-3 h-3" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setIsMaximized(!isMaximized)} title={isMaximized ? 'Minimize' : 'Maximize'}>
            {isMaximized ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
          </Button>
          {isMaximized && (
            <Button variant="ghost" size="icon" onClick={() => setIsMaximized(false)} title="Close">
              <X className="w-3 h-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Terminal Output */}
      <ScrollArea className="flex-1 p-2 font-mono text-sm text-green-300" style={{ fontFamily: 'monospace' }}>
        <div className="space-y-1">
          {outputs.map((output) => (
            <div
              key={output.id}
              className={cn(
                'whitespace-pre-wrap break-all',
                output.type === 'stderr' && 'text-red-400',
                output.type === 'system' && 'text-yellow-400',
                output.type === 'command' && 'text-blue-400',
              )}
            >
              {output.content}
            </div>
          ))}
          <div ref={terminalRef} />
        </div>
      </ScrollArea>

      {/* Terminal Input */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2 px-2 py-1 border-t bg-gray-900">
        <span className="text-green-400 font-mono">$</span>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter command..."
          className="flex-1 bg-transparent border-none outline-none text-green-300 font-mono text-sm"
          autoFocus
        />
      </form>
    </div>
  )
}

// Helper to add output from anywhere
export function addTerminalOutput(type: TerminalOutput['type'], content: string) {
  const win = window as TerminalWindow
  if (win.terminalAddOutput) {
    win.terminalAddOutput(type, content)
  }
}