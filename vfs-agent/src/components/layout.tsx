'use client'

import React, { useState, useCallback } from 'react'
import { VFSExplorer } from './vfs-explorer'
import { MonacoEditor } from './monaco-editor'
import { AgentChat } from './agent-chat'
import { Terminal } from './terminal'
import { useVFSStore } from '@/lib/vfs/store'
import { VFSNode } from '@/lib/vfs/types'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { PanelLeft, PanelRight, PanelTop, PanelBottom, Layout, FileCode, Terminal as TerminalIcon, Bot, X } from 'lucide-react'

interface LayoutState {
  explorerWidth: number
  editorWidth: number
  chatWidth: number
  terminalHeight: number
  previewWidth: number
  showExplorer: boolean
  showChat: boolean
  showTerminal: boolean
  showPreview: boolean
}

const Resizer = ({ vertical, onMouseDown }: { vertical: boolean; onMouseDown: (e: React.MouseEvent) => void }) => (
  <div
    className={cn(
      'relative flex items-center justify-center bg-border/50 hover:bg-border transition-colors',
      vertical ? 'w-1 cursor-col-resize' : 'h-1 cursor-row-resize'
    )}
    onMouseDown={onMouseDown}
  >
    {vertical ? (
      <div className="w-px h-8 bg-border/50" />
    ) : (
      <div className="w-8 h-px bg-border/50" />
    )}
  </div>
)

function PreviewPanel({ activeFile }: { activeFile: VFSNode | null }) {
  if (!activeFile || activeFile.type !== 'file') {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <p className="text-center">Select an HTML file to preview</p>
      </div>
    )
  }

  const isHtml = activeFile.name.endsWith('.html') || activeFile.name.endsWith('.htm')
  
  if (!isHtml) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <p className="text-center">Preview available for HTML files only</p>
      </div>
    )
  }

  const content = activeFile.content || ''
  const blob = new Blob([content], { type: 'text/html' })
  const url = URL.createObjectURL(blob)

  return (
    <iframe
      src={url}
      className="w-full h-full border-0"
      sandbox="allow-scripts allow-same-origin allow-forms allow-pointer-lock"
    />
  )
}

export function MainLayout() {
  const [layout, setLayout] = useState<LayoutState>({
    explorerWidth: 280,
    editorWidth: 0,
    chatWidth: 320,
    terminalHeight: 200,
    previewWidth: 400,
    showExplorer: true,
    showChat: true,
    showTerminal: true,
    showPreview: false,
  })
  const { activeFileId, openFiles, closeFile, setActiveFile, root } = useVFSStore()
  const activeFile = activeFileId ? openFiles.get(activeFileId) || null : null

  const handleExplorerResize = useCallback((e: React.MouseEvent) => {
    const startX = e.clientX
    const startWidth = layout.explorerWidth
    
    const handleMove = (e: MouseEvent) => {
      const newWidth = Math.max(200, Math.min(500, startWidth + (e.clientX - startX)))
      setLayout(prev => ({ ...prev, explorerWidth: newWidth }))
    }
    
    const handleUp = () => {
      document.removeEventListener('mousemove', handleMove)
      document.removeEventListener('mouseup', handleUp)
    }
    
    document.addEventListener('mousemove', handleMove)
    document.addEventListener('mouseup', handleUp)
  }, [layout.explorerWidth])

  const handleChatResize = useCallback((e: React.MouseEvent) => {
    const startX = e.clientX
    const startWidth = layout.chatWidth
    
    const handleMove = (e: MouseEvent) => {
      const newWidth = Math.max(250, Math.min(500, startWidth - (e.clientX - startX)))
      setLayout(prev => ({ ...prev, chatWidth: newWidth }))
    }
    
    const handleUp = () => {
      document.removeEventListener('mousemove', handleMove)
      document.removeEventListener('mouseup', handleUp)
    }
    
    document.addEventListener('mousemove', handleMove)
    document.addEventListener('mouseup', handleUp)
  }, [layout.chatWidth])

  const handleTerminalResize = useCallback((e: React.MouseEvent) => {
    const startY = e.clientY
    const startHeight = layout.terminalHeight
    
    const handleMove = (e: MouseEvent) => {
      const newHeight = Math.max(100, Math.min(500, startHeight + (startY - e.clientY)))
      setLayout(prev => ({ ...prev, terminalHeight: newHeight }))
    }
    
    const handleUp = () => {
      document.removeEventListener('mousemove', handleMove)
      document.removeEventListener('mouseup', handleUp)
    }
    
    document.addEventListener('mousemove', handleMove)
    document.addEventListener('mouseup', handleUp)
  }, [layout.terminalHeight])

  const handlePreviewResize = useCallback((e: React.MouseEvent) => {
    const startX = e.clientX
    const startWidth = layout.previewWidth
    
    const handleMove = (e: MouseEvent) => {
      const newWidth = Math.max(300, Math.min(800, startWidth - (e.clientX - startX)))
      setLayout(prev => ({ ...prev, previewWidth: newWidth }))
    }
    
    const handleUp = () => {
      document.removeEventListener('mousemove', handleMove)
      document.removeEventListener('mouseup', handleUp)
    }
    
    document.addEventListener('mousemove', handleMove)
    document.addEventListener('mouseup', handleUp)
  }, [layout.previewWidth])

  return (
    <div className="flex h-[calc(100vh-60px)] bg-background">
      {/* Explorer Panel */}
      {layout.showExplorer && (
        <>
          <div
            className="flex flex-col bg-card"
            style={{ width: layout.explorerWidth, minWidth: 200, maxWidth: 500 }}
          >
            <VFSExplorer />
          </div>
          <Resizer vertical onMouseDown={handleExplorerResize} />
        </>
      )}

      {/* Main Editor Area */}
      <div className="flex flex-col flex-1 min-w-0" style={{ width: layout.editorWidth }}>
        {/* Open Tabs */}
        <div className="flex items-center border-b bg-card px-2 h-8 overflow-x-auto">
          {Array.from(openFiles.entries()).map(([id, node]) => (
            <button
              key={id}
              className={cn(
                'flex items-center gap-1 px-3 py-1 text-sm font-mono rounded-t-none',
                'border-b-2 transition-colors',
                id === activeFileId
                  ? 'border-primary text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              )}
              onClick={() => setActiveFile(id)}
            >
              <FileCode className="w-3 h-3" />
              <span className="truncate max-w-[150px]">{node.name}</span>
              <button
                className="ml-1 p-0.5 hover:bg-accent rounded"
                onClick={(e) => { e.stopPropagation(); closeFile(id) }}
              >
                <X className="w-3 h-3" />
              </button>
            </button>
          ))}
          {openFiles.size === 0 && (
            <span className="text-sm text-muted-foreground px-3">No files open</span>
          )}
        </div>

        {/* Editor */}
        <div className="flex-1 relative">
          <MonacoEditor
            node={activeFile}
            onClose={() => activeFileId && closeFile(activeFileId)}
            onSave={(path, content) => {
              const { writeFile } = useVFSStore.getState()
              writeFile(path, content)
            }}
          />
        </div>
      </div>

      {/* Chat Panel Resizer */}
      {layout.showChat && <Resizer vertical onMouseDown={handleChatResize} />}

      {/* Chat Panel */}
      {layout.showChat && (
        <div
          className="flex flex-col"
          style={{ width: layout.chatWidth, minWidth: 250, maxWidth: 500 }}
        >
          <AgentChat />
        </div>
      )}

      {/* Preview Panel Resizer */}
      {layout.showPreview && <Resizer vertical onMouseDown={handlePreviewResize} />}

      {/* Preview Panel */}
      {layout.showPreview && (
        <div
          className="flex flex-col bg-card border-l"
          style={{ width: layout.previewWidth, minWidth: 300, maxWidth: 800 }}
        >
          <div className="flex items-center justify-between p-2 border-b bg-muted/50">
            <h3 className="text-sm font-medium">Preview</h3>
            <Button variant="ghost" size="icon" onClick={() => setLayout(prev => ({ ...prev, showPreview: false }))}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex-1 relative">
            <PreviewPanel activeFile={activeFile} />
          </div>
        </div>
      )}
    </div>
  )
}