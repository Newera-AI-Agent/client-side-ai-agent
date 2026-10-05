import { v4 as uuidv4 } from 'uuid';
import { VFSNode } from './types';
import * as idb from './indexedb';

function generateId(): string {
  return uuidv4();
}

function createNode(
  name: string,
  path: string,
  type: 'file' | 'directory',
  content: string = ''
): VFSNode {
  const now = Date.now();
  return {
    id: generateId(),
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

export function createRootNode(): VFSNode {
  return createNode('root', '/', 'directory');
}

export function findNode(root: VFSNode, path: string): VFSNode | null {
  if (path === '/') return root;
  const parts = path.split('/').filter(Boolean);
  let current: VFSNode | undefined = root;
  for (const part of parts) {
    if (!current || current.type !== 'directory' || !current.children) return null;
    current = current.children.find((child) => child.name === part);
    if (!current) return null;
  }
  return current || null;
}

export function findParentNode(root: VFSNode, path: string): VFSNode | null {
  if (path === '/') return null;
  const parts = path.split('/').filter(Boolean);
  if (parts.length === 0) return root;
  const parentPath = '/' + parts.slice(0, -1).join('/');
  return findNode(root, parentPath === '' ? '/' : parentPath);
}

export function addNode(root: VFSNode, parentPath: string, node: VFSNode): VFSNode {
  const parent = findNode(root, parentPath);
  if (!parent || parent.type !== 'directory' || !parent.children) {
    throw new Error(`Parent directory not found: ${parentPath}`);
  }
  const newNode = { ...node, path: parentPath === '/' ? `/${node.name}` : `${parentPath}/${node.name}` };
  parent.children.push(newNode);
  parent.updatedAt = Date.now();
  return newNode;
}

export function removeNode(root: VFSNode, path: string): boolean {
  const parent = findParentNode(root, path);
  if (!parent || parent.type !== 'directory' || !parent.children) return false;
  const index = parent.children.findIndex((child) => child.path === path);
  if (index === -1) return false;
  parent.children.splice(index, 1);
  parent.updatedAt = Date.now();
  return true;
}

export function moveNode(root: VFSNode, srcPath: string, destPath: string): VFSNode | null {
  const node = findNode(root, srcPath);
  if (!node) return null;
  const parent = findParentNode(root, srcPath);
  if (parent && parent.type === 'directory' && parent.children) {
    const index = parent.children.findIndex((child) => child.path === srcPath);
    if (index !== -1) parent.children.splice(index, 1);
  }
  const destParent = findNode(root, destPath);
  if (!destParent || destParent.type !== 'directory' || !destParent.children) return null;
  node.path = destPath === '/' ? `/${node.name}` : `${destPath}/${node.name}`;
  updateNodePaths(node, node.path);
  destParent.children.push(node);
  destParent.updatedAt = Date.now();
  return node;
}

function updateNodePaths(node: VFSNode, newPath: string): void {
  node.path = newPath;
  if (node.type === 'directory' && node.children) {
    for (const child of node.children) {
      updateNodePaths(child, newPath === '/' ? `/${child.name}` : `${newPath}/${child.name}`);
    }
  }
}

export function updateNodeContent(root: VFSNode, path: string, content: string): VFSNode | null {
  const node = findNode(root, path);
  if (!node || node.type !== 'file') return null;
  node.content = content;
  node.size = new Blob([content]).size;
  node.updatedAt = Date.now();
  return node;
}

export function listNodes(root: VFSNode, path: string): VFSNode[] {
  const node = findNode(root, path);
  if (!node || node.type !== 'directory' || !node.children) return [];
  return [...node.children].sort((a, b) => {
    if (a.type !== b.type) return a.type === 'directory' ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
}

export async function persistNode(node: VFSNode): Promise<void> {
  await idb.saveVFSNode(node);
  if (node.type === 'directory' && node.children) {
    for (const child of node.children) {
      await persistNode(child);
    }
  }
}

export async function loadVFSFromDB(): Promise<VFSNode | null> {
  const nodes = await idb.getAllVFSNodes();
  if (nodes.length === 0) return null;
  const root = nodes.find((n) => n.path === '/');
  if (!root) return null;
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  for (const node of nodes) {
    if (node.type === 'directory') {
      node.children = nodes.filter((n) => findParentNode(root, n.path)?.id === node.id);
    }
  }
  return root;
}

export async function saveVFSToDB(root: VFSNode): Promise<void> {
  await idb.clearVFS();
  await persistNode(root);
  await idb.setMetadata('vfs', { version: 1, lastSync: Date.now() });
}

export function cloneNode(node: VFSNode): VFSNode {
  return JSON.parse(JSON.stringify(node));
}