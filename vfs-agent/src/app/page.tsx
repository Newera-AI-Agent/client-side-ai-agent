import React from 'react'
import { MainLayout } from '@/components/layout'
import { Header } from '@/components/header'
import { Terminal } from '@/components/terminal'
import { useVFSStore } from '@/lib/vfs/store'

// Client-side component that initializes VFS
function AppContent() {
  const initialize = useVFSStore(state => state.initialize)
  
  React.useEffect(() => {
    initialize()
  }, [initialize])

  return (
    <div className="flex flex-col h-screen bg-background">
      <Header />
      <MainLayout />
      <Terminal />
    </div>
  )
}

export default function Home() {
  return (
    <AppContent />
  )
}