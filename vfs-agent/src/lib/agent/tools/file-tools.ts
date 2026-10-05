import { Tool, ToolResult } from '../types';
import { useVFSStore } from '@/lib/vfs/store';

function getStore() {
  return useVFSStore.getState();
}

export const writeFileTool: Tool = {
  name: 'write_file',
  description: 'Create a new file or overwrite an existing file with content',
  parameters: {
    type: 'object',
    properties: {
      path: { type: 'string', description: 'The path of the file to write (relative to root)' },
      content: { type: 'string', description: 'The content to write to the file' },
    },
    required: ['path', 'content'],
  },
  execute: async (args): Promise<ToolResult> => {
    try {
      const { path, content } = args as { path: string; content: string };
      const parentPath = path.substring(0, path.lastIndexOf('/')) || '/';
      const fileName = path.substring(path.lastIndexOf('/') + 1);
      const store = getStore();
      
      // Check if file exists
      const existing = store.readFile(path);
      if (existing) {
        store.writeFile(path, content);
        return { success: true, output: `File updated: ${path}` };
      } else {
        store.createFile(parentPath, fileName, content);
        return { success: true, output: `File created: ${path}` };
      }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to write file' };
    }
  },
};

export const readFileTool: Tool = {
  name: 'read_file',
  description: 'Read the content of a file',
  parameters: {
    type: 'object',
    properties: {
      path: { type: 'string', description: 'The path of the file to read' },
    },
    required: ['path'],
  },
  execute: async (args): Promise<ToolResult> => {
    try {
      const { path } = args as { path: string };
      const store = getStore();
      const node = store.readFile(path);
      if (!node) {
        return { success: false, error: `File not found: ${path}` };
      }
      if (node.type !== 'file') {
        return { success: false, error: `Not a file: ${path}` };
      }
      return { success: true, output: node.content || '' };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to read file' };
    }
  },
};

export const editFileTool: Tool = {
  name: 'edit_file',
  description: 'Edit a file by replacing a specific string with another string',
  parameters: {
    type: 'object',
    properties: {
      path: { type: 'string', description: 'The path of the file to edit' },
      oldString: { type: 'string', description: 'The string to replace' },
      newString: { type: 'string', description: 'The string to replace with' },
    },
    required: ['path', 'oldString', 'newString'],
  },
  execute: async (args): Promise<ToolResult> => {
    try {
      const { path, oldString, newString } = args as { path: string; oldString: string; newString: string };
      const store = getStore();
      const node = store.readFile(path);
      if (!node || node.type !== 'file') {
        return { success: false, error: `File not found: ${path}` };
      }
      const content = node.content || '';
      if (!content.includes(oldString)) {
        return { success: false, error: 'Old string not found in file' };
      }
      const newContent = content.replace(oldString, newString);
      store.writeFile(path, newContent);
      return { success: true, output: `File edited: ${path}` };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to edit file' };
    }
  },
};

export const deleteFileTool: Tool = {
  name: 'delete_file',
  description: 'Delete a file or directory',
  parameters: {
    type: 'object',
    properties: {
      path: { type: 'string', description: 'The path of the file or directory to delete' },
    },
    required: ['path'],
  },
  execute: async (args): Promise<ToolResult> => {
    try {
      const { path } = args as { path: string };
      const store = getStore();
      const result = store.deleteNode(path);
      if (result) {
        return { success: true, output: `Deleted: ${path}` };
      }
      return { success: false, error: `Not found: ${path}` };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to delete' };
    }
  },
};

export const moveFileTool: Tool = {
  name: 'move_file',
  description: 'Move or rename a file or directory',
  parameters: {
    type: 'object',
    properties: {
      srcPath: { type: 'string', description: 'The source path' },
      destPath: { type: 'string', description: 'The destination path' },
    },
    required: ['srcPath', 'destPath'],
  },
  execute: async (args): Promise<ToolResult> => {
    try {
      const { srcPath, destPath } = args as { srcPath: string; destPath: string };
      const store = getStore();
      const result = store.moveNode(srcPath, destPath);
      if (result) {
        return { success: true, output: `Moved ${srcPath} to ${destPath}` };
      }
      return { success: false, error: `Failed to move: ${srcPath}` };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to move' };
    }
  },
};

export const listFilesTool: Tool = {
  name: 'list_files',
  description: 'List files and directories in a given path',
  parameters: {
    type: 'object',
    properties: {
      path: { type: 'string', description: 'The path to list (default: root)' },
    },
    required: [],
  },
  execute: async (args): Promise<ToolResult> => {
    try {
      const { path = '/' } = args as { path?: string };
      const store = getStore();
      const nodes = store.listDirectory(path);
      return {
        success: true,
        output: nodes.map((n) => ({
          name: n.name,
          path: n.path,
          type: n.type,
          size: n.size,
          updatedAt: n.updatedAt,
        })),
      };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to list files' };
    }
  },
};

export const fileTools = [
  writeFileTool,
  readFileTool,
  editFileTool,
  deleteFileTool,
  moveFileTool,
  listFilesTool,
];