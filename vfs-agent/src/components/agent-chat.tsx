'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useVFSStore } from '@/lib/vfs/store'
import { agent } from '@/lib/agent/loop'
import { AgentStep } from '@/lib/agent/types'
import { cn, formatDate } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@radix-ui/react-scroll-area'
import { Send, Loader2, Terminal, Brain, Eye, ChevronDown } from 'lucide-react'

export function AgentChat() {
  const [input, setInput] = useState('')
  const [isRunning, setIsRunning] = useState(false)
  const [steps, setSteps] = useState<AgentStep[]>([])
  const [showReasoning, setShowReasoning] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { saveToDB } = useVFSStore()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [steps])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isRunning) return

    const task = input
    setInput('')
    setIsRunning(true)
    
    // Add user message
    setSteps(prev => [...prev, {
      type: 'thought',
      content: task,
      timestamp: Date.now(),
    }])

    try {
      const result = await agent.run(task)
      setSteps(result)
    } catch (error) {
      setSteps(prev => [...prev, {
        type: 'observation',
        content: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: Date.now(),
      }])
    } finally {
      setIsRunning(false)
      await saveToDB()
    }
  }

  const getStepIcon = (step: AgentStep) => {
    switch (step.type) {
      case 'thought': return <Brain className="w-4 h-4 text-primary" />
      case 'action': return <Terminal className="w-4 h-4 text-blue-500" />
      case 'observation': return <Eye className="w-4 h-4 text-green-500" />
    }
  }

  const getStepColor = (step: AgentStep) => {
    switch (step.type) {
      case 'thought': return 'border-l-primary'
      case 'action': return 'border-l-blue-500'
      case 'observation': return 'border-l-green-500'
    }
  }

  return (
    <div className="flex flex-col h-full border-l bg-card">
      {/* Header */}
      <div className="p-2 border-b flex items-center justify-between">
        <h3 className="text-sm font-medium">Agent</h3>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowReasoning(!showReasoning)}
            title={showReasoning ? 'Hide reasoning' : 'Show reasoning'}
          >
            {showReasoning ? <ChevronDown className="w-4 h-4" /> : <Brain className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Steps Display */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-3">
          {steps.map((step, index) => (
            showReasoning || step.type !== 'thought' ? (
              <div
                key={index}
                className={cn(
                  'relative pl-3 border-l-2 rounded-r p-2 text-sm',
                  getStepColor(step)
                )}
              >
                <div className="flex items-start gap-2">
                  <div className="flex-shrink-0 mt-0.5">{getStepIcon(step)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium capitalize">{step.type}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(step.timestamp)}
                      </span>
                    </div>
                    <pre className="whitespace-pre-wrap text-sm font-mono">{step.content}</pre>
                    {step.toolName && (
                      <div className="mt-1 text-xs text-muted-foreground">
                        Tool: {step.toolName}
                        {step.toolArgs && (
                          <span className="ml-2">Args: {JSON.stringify(step.toolArgs)}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : null
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-2 border-t">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter a task for the agent..."
            disabled={isRunning}
            className="flex-1"
          />
          <Button type="submit" disabled={isRunning || !input.trim()}>
            {isRunning ? (
              <> <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Running... </>
            ) : (
              <> <Send className="w-4 h-4" /> </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}