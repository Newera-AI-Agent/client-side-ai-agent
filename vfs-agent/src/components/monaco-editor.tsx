'use client'

import React, { useEffect, useRef, useState } from 'react'
import Editor from '@monaco-editor/react'
import { useVFSStore } from '@/lib/vfs/store'
import { VFSNode } from '@/lib/vfs/types'
import { getFileLanguage } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { X, Save, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface MonacoEditorProps {
  node: VFSNode | null
  onClose: () => void
  onSave: (path: string, content: string) => void
}

export function MonacoEditor({ node, onClose, onSave }: MonacoEditorProps) {
  const [content, setContent] = useState('')
  const [language, setLanguage] = useState('plaintext')
  const [isDirty, setIsDirty] = useState(false)
  const editorRef = useRef<unknown>(null)
  const { writeFile } = useVFSStore()

  useEffect(() => {
    if (node && node.type === 'file') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setContent(node.content || '')
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLanguage(getFileLanguage(node.name))
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsDirty(false)
    }
  }, [node])

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      setContent(value)
      setIsDirty(value !== (node?.content || ''))
    }
  }

  const handleSave = () => {
    if (node) {
      onSave(node.path, content)
      setIsDirty(false)
    }
  }

  const handleDownload = () => {
    if (node) {
      const blob = new Blob([content], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = node.name
      a.click()
      URL.revokeObjectURL(url)
    }
  }

  if (!node || node.type !== 'file') {
    return (
      <div className="flex flex-col h-full bg-background">
        <div className="flex items-center justify-center h-full text-muted-foreground">
          No file selected
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Editor Toolbar */}
      <div className="flex items-center justify-between border-b px-2 py-1 bg-card">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={onClose} title="Close">
            <X className="w-4 h-4" />
          </Button>
          <span className="text-sm font-medium truncate max-w-[200px]">{node.name}</span>
          <span className="text-xs text-muted-foreground uppercase">{language}</span>
          {isDirty && <span className="text-xs text-yellow-500">●</span>}
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={handleSave} disabled={!isDirty} title="Save (Ctrl+S)">
            <Save className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleDownload} title="Download">
            <Download className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 relative">
        <Editor
          height="100%"
          defaultLanguage={language}
          value={content}
          onChange={handleEditorChange}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            wordWrap: 'on',
            bracketPairColorization: { enabled: true },
            guides: { bracketPairs: true },
          }}
          onMount={async (editor, monaco) => {
            editorRef.current = editor
            // Add Ctrl+S save shortcut
            editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
              handleSave()
            })
          }}
        />
      </div>
    </div>
  )
}