'use client'

import React, { useState } from 'react'
import { useVFSStore } from '@/lib/vfs/store'
import { VFSNode } from '@/lib/vfs/types'
import { cn, formatFileSize, formatDate, getFileLanguage } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  FolderOpen,
  FolderClosed,
  File,
  Plus,
  Trash2,
  Edit2,
  Copy,
  Download,
  MoreHorizontal,
  ChevronRight,
  ChevronDown,
} from 'lucide-react'

interface FileTreeProps {
  node: VFSNode;
  depth?: number;
  onSelect?: (node: VFSNode) => void;
  onContextMenu?: (event: React.MouseEvent, node: VFSNode) => void;
}

function FileTree({ node, depth = 0, onSelect, onContextMenu }: FileTreeProps) {
  const [isExpanded, setIsExpanded] = useState(node.type === 'directory')
  const { deleteNode, openFile } = useVFSStore()

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (node.type === 'directory') {
      setIsExpanded(!isExpanded)
    } else {
      onSelect?.(node)
    }
  }

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onContextMenu?.(e, node)
  }

  if (node.type === 'file') {
    return (
      <div
        className={cn('flex items-center gap-1 pl-2 pr-2 py-1', depth > 0 && 'pl-4')}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
      >
        <File className="w-4 h-4 text-muted-foreground" />
        <span className="flex-1 truncate text-sm">{node.name}</span>
        <span className="text-xs text-muted-foreground">{formatFileSize(node.size)}</span>
      </div>
    )
  }

  return (
    <div onContextMenu={handleContextMenu}>
      <div
        className={cn('flex items-center gap-1 pl-2 pr-2 py-1 cursor-pointer', depth > 0 && 'pl-4')}
        onClick={handleClick}
      >
        {isExpanded ? (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        )}
        <FolderOpen className="w-4 h-4 text-muted-foreground" />
        <span className="flex-1 truncate text-sm font-medium">{node.name}</span>
      </div>
      {isExpanded && node.children && (
        <div>
          {node.children.map((child) => (
            <FileTree
              key={child.id}
              node={child}
              depth={depth + 1}
              onSelect={onSelect}
              onContextMenu={onContextMenu}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export function VFSExplorer() {
  const { root, listDirectory, createFile, createDirectory, deleteNode, openFile } = useVFSStore()
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; node: VFSNode } | null>(null)
  const [newName, setNewName] = useState('')
  const [creatingType, setCreatingType] = useState<'file' | 'directory' | null>(null)
  const [parentPath, setParentPath] = useState('')

  const handleContextMenu = (e: React.MouseEvent, node: VFSNode) => {
    e.preventDefault()
    setContextMenu({ x: e.clientX, y: e.clientY, node })
  }

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim() || !creatingType || !parentPath) return
    
    if (creatingType === 'file') {
      createFile(parentPath, newName)
    } else {
      createDirectory(parentPath, newName)
    }
    setNewName('')
    setCreatingType(null)
    setParentPath('')
    setContextMenu(null)
  }

  const handleDelete = () => {
    if (contextMenu) {
      deleteNode(contextMenu.node.path)
      setContextMenu(null)
    }
  }

  const handleNewFile = (path: string) => {
    setCreatingType('file')
    setParentPath(path)
    setContextMenu(null)
  }

  const handleNewDirectory = (path: string) => {
    setCreatingType('directory')
    setParentPath(path)
    setContextMenu(null)
  }

  React.useEffect(() => {
    const handleClickOutside = () => setContextMenu(null)
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  return (
    <div className="flex flex-col h-full border-r bg-background">
      <div className="p-2 border-b flex items-center gap-2">
        <h3 className="text-sm font-medium flex-1">Explorer</h3>
        <Button variant="ghost" size="icon" onClick={() => handleNewFile('/')} title="New file">
          <Plus className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => handleNewDirectory('/')} title="New folder">
          <FolderOpen className="w-4 h-4" />
        </Button>
      </div>
      
      <div className="flex-1 overflow-auto p-2">
        <FileTree
          node={root}
          onSelect={(node) => openFile(node.path)}
          onContextMenu={handleContextMenu}
        />
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div
          className="fixed z-50 bg-popover border rounded-md shadow-lg p-1 min-w-[160px]"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          {creatingType ? (
            <form onSubmit={handleCreate} className="p-2">
              <Input
                autoFocus
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder={creatingType === 'file' ? 'File name' : 'Folder name'}
                className="mb-2"
              />
              <div className="flex gap-2">
                <Button type="submit" size="sm" className="flex-1">Create</Button>
                <Button type="button" variant="ghost" size="sm" className="flex-1" onClick={() => { setCreatingType(null); setNewName('') }}>Cancel</Button>
              </div>
            </form>
          ) : (
            <>
              <Button
                variant="ghost"
                className="w-full justify-start px-2 py-1 text-sm"
                onClick={() => handleNewFile(contextMenu.node.type === 'directory' ? contextMenu.node.path : contextMenu.node.path.substring(0, contextMenu.node.path.lastIndexOf('/')) || '/')}
              >
                <Plus className="w-3 h-3 mr-2" /> New File
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start px-2 py-1 text-sm"
                onClick={() => handleNewDirectory(contextMenu.node.type === 'directory' ? contextMenu.node.path : contextMenu.node.path.substring(0, contextMenu.node.path.lastIndexOf('/')) || '/')}
              >
                <FolderOpen className="w-3 h-3 mr-2" /> New Folder
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start px-2 py-1 text-sm"
                onClick={() => { /* open in editor */ }}
              >
                <Edit2 className="w-3 h-3 mr-2" /> Open
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start px-2 py-1 text-sm"
                onClick={() => { /* copy path */ }}
              >
                <Copy className="w-3 h-3 mr-2" /> Copy Path
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start px-2 py-1 text-sm"
                onClick={() => { /* download */ }}
              >
                <Download className="w-3 h-3 mr-2" /> Download
              </Button>
              <hr className="my-1" />
              <Button
                variant="ghost"
                className="w-full justify-start px-2 py-1 text-sm text-destructive"
                onClick={handleDelete}
              >
                <Trash2 className="w-3 h-3 mr-2" /> Delete
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  )
}