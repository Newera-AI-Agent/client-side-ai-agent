export interface VFSNode {
  id: string;
  name: string;
  path: string;
  type: 'file' | 'directory';
  content?: string;
  children?: VFSNode[];
  createdAt: number;
  updatedAt: number;
  size: number;
  isBinary?: boolean;
}

export interface VFSState {
  root: VFSNode;
  openFiles: Map<string, VFSNode>;
  activeFileId: string | null;
}