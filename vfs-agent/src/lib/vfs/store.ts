import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { VFSNode } from './types';
import { createRootNode, findNode, addNode, removeNode, moveNode, updateNodeContent, listNodes, cloneNode, saveVFSToDB, loadVFSFromDB } from './core';

interface VFSStore {
  root: VFSNode;
  openFiles: Map<string, VFSNode>;
  activeFileId: string | null;
  
  initialize: () => Promise<void>;
  createFile: (path: string, name: string, content?: string) => VFSNode;
  createDirectory: (path: string, name: string) => VFSNode;
  readFile: (path: string) => VFSNode | null;
  writeFile: (path: string, content: string) => VFSNode | null;
  deleteNode: (path: string) => boolean;
  moveNode: (srcPath: string, destPath: string) => VFSNode | null;
  listDirectory: (path: string) => VFSNode[];
  openFile: (path: string) => VFSNode | null;
  closeFile: (id: string) => void;
  setActiveFile: (id: string | null) => void;
  getTree: () => VFSNode;
  exportVFS: () => VFSNode;
  importVFS: (root: VFSNode) => void;
  saveToDB: () => Promise<void>;
}

export const useVFSStore = create<VFSStore>()(
  persist(
    (set, get) => ({
      root: createRootNode(),
      openFiles: new Map(),
      activeFileId: null,

      initialize: async () => {
        const loaded = await loadVFSFromDB();
        if (loaded) {
          set({ root: loaded });
        }
      },

      createFile: (parentPath, name, content = '') => {
        const { root } = get();
        const newNode = { ...createNode(name, '', 'file', content) };
        addNode(root, parentPath, newNode);
        set({ root: cloneNode(root) });
        return newNode;
      },

      createDirectory: (parentPath, name) => {
        const { root } = get();
        const newNode = createNode(name, '', 'directory');
        addNode(root, parentPath, newNode);
        set({ root: cloneNode(root) });
        return newNode;
      },

      readFile: (path) => {
        const { root } = get();
        return findNode(root, path);
      },

      writeFile: (path, content) => {
        const { root } = get();
        const node = updateNodeContent(root, path, content);
        if (node) {
          set({ root: cloneNode(root) });
        }
        return node;
      },

      deleteNode: (path) => {
        const { root } = get();
        const result = removeNode(root, path);
        if (result) {
          set({ root: cloneNode(root) });
        }
        return result;
      },

      moveNode: (srcPath, destPath) => {
        const { root } = get();
        const node = moveNode(root, srcPath, destPath);
        if (node) {
          set({ root: cloneNode(root) });
        }
        return node;
      },

      listDirectory: (path) => {
        const { root } = get();
        return listNodes(root, path);
      },

      openFile: (path) => {
        const { root, openFiles } = get();
        const node = findNode(root, path);
        if (node && node.type === 'file') {
          const newOpenFiles = new Map(openFiles);
          newOpenFiles.set(node.id, node);
          set({ openFiles: newOpenFiles, activeFileId: node.id });
          return node;
        }
        return null;
      },

      closeFile: (id) => {
        const { openFiles, activeFileId } = get();
        const newOpenFiles = new Map(openFiles);
        newOpenFiles.delete(id);
        set({
          openFiles: newOpenFiles,
          activeFileId: activeFileId === id ? null : activeFileId,
        });
      },

      setActiveFile: (id) => set({ activeFileId: id }),

      getTree: () => get().root,

      exportVFS: () => cloneNode(get().root),

      importVFS: (root) => set({ root: cloneNode(root) }),

      saveToDB: async () => {
        await saveVFSToDB(get().root);
      },
    }),
    {
      name: 'vfs-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        openFiles: Array.from(state.openFiles.entries()),
        activeFileId: state.activeFileId,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.openFiles = new Map(state.openFiles as any);
        }
      },
    }
  )
);

function createNode(name: string, path: string, type: 'file' | 'directory', content: string = ''): VFSNode {
  const now = Date.now();
  return {
    id: crypto.randomUUID(),
    name,
    path,
    type,
    content: type === 'file' ? content : undefined,
    children: type === 'directory' ? [] : undefined,
    createdAt: now,
    updatedAt: now,
    size: type === 'file' ? new Blob([content]).size : 0,
  };
}