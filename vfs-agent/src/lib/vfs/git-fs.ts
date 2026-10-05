import { useVFSStore } from './store';
import { VFSNode } from './types';

// Custom fs adapter for isomorphic-git using our VFS
function getStore() {
  return useVFSStore.getState();
}

function findNode(path: string): VFSNode | null {
  return getStore().readFile(path);
}

function getParentDir(path: string): string {
  const parts = path.split('/').filter(Boolean);
  if (parts.length <= 1) return '/';
  return '/' + parts.slice(0, -1).join('/');
}

export const fs = {
  // Read file as string
  async readFile(path: string): Promise<string> {
    const node = findNode(path);
    if (!node || node.type !== 'file') {
      throw new Error(`File not found: ${path}`);
    }
    return node.content || '';
  },

  // Write file from string
  async writeFile(path: string, data: string): Promise<void> {
    const parentPath = getParentDir(path);
    const fileName = path.split('/').filter(Boolean).pop() || '';
    const store = getStore();
    const existing = store.readFile(path);
    if (existing) {
      store.writeFile(path, data);
    } else {
      store.createFile(parentPath, fileName, data);
    }
  },

  // Append to file
  async appendFile(path: string, data: string): Promise<void> {
    const node = findNode(path);
    if (!node || node.type !== 'file') {
      throw new Error(`File not found: ${path}`);
    }
    const store = getStore();
    store.writeFile(path, (node.content || '') + data);
  },

  // Remove file
  async unlink(path: string): Promise<void> {
    const store = getStore();
    store.deleteNode(path);
  },

  // Check if path exists
  async exists(path: string): Promise<boolean> {
    return findNode(path) !== null;
  },

  // Check if path is a directory
  async isDirectory(path: string): Promise<boolean> {
    const node = findNode(path);
    return node?.type === 'directory' || false;
  },

  // List directory contents
  async readdir(path: string): Promise<string[]> {
    const node = findNode(path);
    if (!node || node.type !== 'directory' || !node.children) {
      return [];
    }
    return node.children.map(child => child.name);
  },

  // Create directory
  async mkdir(path: string): Promise<void> {
    const parentPath = getParentDir(path);
    const dirName = path.split('/').filter(Boolean).pop() || '';
    const store = getStore();
    const existing = store.readFile(path);
    if (!existing) {
      store.createDirectory(parentPath, dirName);
    }
  },

  // Remove directory
  async rmdir(path: string): Promise<void> {
    const store = getStore();
    store.deleteNode(path);
  },

  // Read file as Uint8Array (for binary files)
  async readFileAsUint8Array(path: string): Promise<Uint8Array> {
    const content = await this.readFile(path);
    return new TextEncoder().encode(content);
  },

  // Write file from Uint8Array
  async writeFileFromUint8Array(path: string, data: Uint8Array): Promise<void> {
    const content = new TextDecoder().decode(data);
    await this.writeFile(path, content);
  },

  // Get file stats
  async lstat(path: string): Promise<{ isFile(): boolean; isDirectory(): boolean; size: number; mtime: Date }> {
    const node = findNode(path);
    if (!node) {
      throw new Error(`Path not found: ${path}`);
    }
    return {
      isFile: () => node.type === 'file',
      isDirectory: () => node.type === 'directory',
      size: node.size,
      mtime: new Date(node.updatedAt),
    };
  },

  async stat(path: string): Promise<{ isFile(): boolean; isDirectory(): boolean; size: number; mtime: Date }> {
    return this.lstat(path);
  },
};