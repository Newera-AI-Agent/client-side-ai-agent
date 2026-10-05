'use client'

import React, { useState, useRef } from 'react'
import { useVFSStore } from '@/lib/vfs/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { FolderOpen, FileText, Download, Upload, Archive, Save, RotateCw, Menu, Sun, Moon } from 'lucide-react'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'

export function Header() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark')
  const [showImport, setShowImport] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { root, importVFS, exportVFS, saveToDB, initialize } = useVFSStore()

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
    document.documentElement.classList.toggle('dark', newTheme === 'dark')
    localStorage.setItem('theme', newTheme)
  }

  React.useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null
    if (savedTheme) {
      setTheme(savedTheme)
      document.documentElement.classList.toggle('dark', savedTheme === 'dark')
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark')
      document.documentElement.classList.add('dark')
    }
  }, [])

  const handleExport = async () => {
    try {
      const vfs = exportVFS()
      const zip = new JSZip()
      
      function addNodesToZip(node: any, prefix = '') {
        const path = prefix ? `${prefix}/${node.name}` : node.name
        if (node.type === 'file') {
          zip.file(path, node.content || '')
        } else if (node.type === 'directory' && node.children) {
          for (const child of node.children) {
            addNodesToZip(child, path)
          }
        }
      }
      
      addNodesToZip(vfs)
      const content = await zip.generateAsync({ type: 'blob' })
      saveAs(content, 'vfs-export.zip')
    } catch (error) {
      console.error('Export failed:', error)
      alert('Export failed')
    }
  }

  const handleImport = async (file: File) => {
    try {
      const zip = new JSZip()
      const content = await zip.loadAsync(file)
      
      async function buildVFS(zip: any, path = ''): Promise<any> {
        const node: any = {
          id: crypto.randomUUID(),
          name: path.split('/').pop() || 'root',
          path: path || '/',
          type: 'directory',
          children: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
          size: 0,
        }
        
        for (const [name, file] of Object.entries(zip.files as Record<string, { dir: boolean; async(type: string): Promise<string> }>)) {
          if (file.dir) continue
          const relativePath = path ? name.replace(path + '/', '') : name
          const parts = relativePath.split('/')
          let current = node
          
          for (let i = 0; i < parts.length - 1; i++) {
            const part = parts[i]
            let child = current.children.find((c: any) => c.name === part)
            if (!child) {
              child = {
                id: crypto.randomUUID(),
                name: part,
                path: [...current.path.split('/').filter(Boolean), part].join('/'),
                type: 'directory',
                children: [],
                createdAt: Date.now(),
                updatedAt: Date.now(),
                size: 0,
              }
              current.children.push(child)
            }
            current = child
          }
          
          const fileName = parts[parts.length - 1]
          const fileContent = await file.async('text')
          current.children.push({
            id: crypto.randomUUID(),
            name: fileName,
            path: [...current.path.split('/').filter(Boolean), fileName].join('/'),
            type: 'file',
            content: fileContent,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            size: new Blob([fileContent]).size,
          })
        }
        
        return node
      }
      
      const vfsRoot = buildVFS(content)
      importVFS(vfsRoot)
      await saveToDB()
      setShowImport(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    } catch (error) {
      console.error('Import failed:', error)
      alert('Import failed')
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleImport(file)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.currentTarget.classList.add('bg-primary/10')
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('bg-primary/10')
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.currentTarget.classList.remove('bg-primary/10')
    const file = e.dataTransfer.files[0]
    if (file && file.name.endsWith('.zip')) {
      handleImport(file)
    }
  }

  return (
    <header className="flex items-center justify-between h-12 px-4 border-b bg-card">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-semibold">VFS Agent</h1>
        <div className="w-px h-6 bg-border" />
        <Button variant="ghost" size="icon" onClick={handleExport} title="Export as ZIP">
          <Download className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => fileInputRef.current?.click()} title="Import ZIP">
          <Upload className="w-4 h-4" />
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".zip"
          className="hidden"
          onChange={handleFileSelect}
        />
        <Button variant="ghost" size="icon" onClick={async () => { await saveToDB(); alert('Saved to IndexedDB') }} title="Save to IndexedDB">
          <Save className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={async () => { await initialize(); alert('Loaded from IndexedDB') }} title="Load from IndexedDB">
          <RotateCw className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <div
          className="relative"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept=".zip"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileSelect}
          />
          <div className="flex items-center gap-2 px-3 py-1 rounded border bg-muted/50 text-sm text-muted-foreground">
            <Archive className="w-4 h-4" />
            <span>Drop ZIP here or click to import</span>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </Button>
      </div>
    </header>
  )
}