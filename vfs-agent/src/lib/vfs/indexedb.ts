import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { VFSNode } from './types';

interface VFSDB extends DBSchema {
  vfs: {
    key: string;
    value: VFSNode;
    indexes: { 'by-path': string };
  };
  metadata: {
    key: string;
    value: { version: number; lastSync: number };
  };
}

let dbInstance: IDBPDatabase<VFSDB> | null = null;

const DB_NAME = 'vfs-agent-db';
const DB_VERSION = 1;

async function getDB(): Promise<IDBPDatabase<VFSDB>> {
  if (dbInstance) return dbInstance;
  dbInstance = await openDB<VFSDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      const vfsStore = db.createObjectStore('vfs', { keyPath: 'id' });
      vfsStore.createIndex('by-path', 'path');
      db.createObjectStore('metadata', { keyPath: 'key' });
    },
  });
  return dbInstance;
}

export async function saveVFSNode(node: VFSNode): Promise<void> {
  const db = await getDB();
  await db.put('vfs', node);
}

export async function getVFSNode(id: string): Promise<VFSNode | undefined> {
  const db = await getDB();
  return db.get('vfs', id);
}

export async function getAllVFSNodes(): Promise<VFSNode[]> {
  const db = await getDB();
  return db.getAll('vfs');
}

export async function deleteVFSNode(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('vfs', id);
}

export async function clearVFS(): Promise<void> {
  const db = await getDB();
  await db.clear('vfs');
}

export async function setMetadata(key: string, value: { version: number; lastSync: number }): Promise<void> {
  const db = await getDB();
  await db.put('metadata', { version: value.version, lastSync: value.lastSync }, key);
}

export async function getMetadata(key: string): Promise<{ version: number; lastSync: number } | undefined> {
  const db = await getDB();
  return db.get('metadata', key);
}