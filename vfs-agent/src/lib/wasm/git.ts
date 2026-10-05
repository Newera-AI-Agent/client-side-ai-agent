import { Tool, ToolResult } from '@/lib/agent/types';
import * as git from 'isomorphic-git';
import { fs } from '@/lib/vfs/git-fs';

export const gitInitTool: Tool = {
  name: 'git_init',
  description: 'Initialize a new Git repository',
  parameters: {
    type: 'object',
    properties: {
      path: { type: 'string', description: 'Repository path (default: /)' },
      defaultBranch: { type: 'string', description: 'Default branch name (default: main)' },
    },
    required: [],
  },
  execute: async (args): Promise<ToolResult> => {
    try {
      const { path = '/', defaultBranch = 'main' } = args as { path?: string; defaultBranch?: string };
      await git.init({ fs, dir: path, defaultBranch });
      return { success: true, output: `Git repository initialized at ${path}` };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Git init failed' };
    }
  },
};

export const gitAddTool: Tool = {
  name: 'git_add',
  description: 'Add files to Git staging area',
  parameters: {
    type: 'object',
    properties: {
      path: { type: 'string', description: 'Repository path' },
      filepath: { type: 'string', description: 'File or pattern to add (e.g., "." for all)' },
    },
    required: ['path', 'filepath'],
  },
  execute: async (args): Promise<ToolResult> => {
    try {
      const { path, filepath } = args as { path: string; filepath: string };
      await git.add({ fs, dir: path, filepath });
      return { success: true, output: `Added ${filepath} to staging` };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Git add failed' };
    }
  },
};

export const gitCommitTool: Tool = {
  name: 'git_commit',
  description: 'Create a Git commit',
  parameters: {
    type: 'object',
    properties: {
      path: { type: 'string', description: 'Repository path' },
      message: { type: 'string', description: 'Commit message' },
      author: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          email: { type: 'string' },
        },
        required: ['name', 'email'],
      },
    },
    required: ['path', 'message', 'author'],
  },
  execute: async (args): Promise<ToolResult> => {
    try {
      const { path, message, author } = args as { path: string; message: string; author: { name: string; email: string } };
      const sha = await git.commit({ fs, dir: path, message, author });
      return { success: true, output: `Commit created: ${sha}` };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Git commit failed' };
    }
  },
};

export const gitLogTool: Tool = {
  name: 'git_log',
  description: 'Show Git commit history',
  parameters: {
    type: 'object',
    properties: {
      path: { type: 'string', description: 'Repository path' },
      depth: { type: 'number', description: 'Number of commits to show (default: 10)' },
    },
    required: ['path'],
  },
  execute: async (args): Promise<ToolResult> => {
    try {
      const { path, depth = 10 } = args as { path: string; depth?: number };
      const commits = await git.log({ fs, dir: path, depth });
      return { success: true, output: commits };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Git log failed' };
    }
  },
};

export const gitDiffTool: Tool = {
  name: 'git_diff',
  description: 'Show Git diff (compares working tree with HEAD)',
  parameters: {
    type: 'object',
    properties: {
      path: { type: 'string', description: 'Repository path' },
      filepath: { type: 'string', description: 'File to diff (optional, shows all if not provided)' },
    },
    required: ['path'],
  },
  execute: async (args): Promise<ToolResult> => {
    try {
      const { path, filepath } = args as { path: string; filepath?: string };
      // Use statusMatrix to get file statuses, then show diffs
      const status = await git.statusMatrix({ fs, dir: path });
      let output = '';
      for (const [file, head, workdir, stage] of status) {
        if (filepath && file !== filepath) continue;
        if (workdir !== 1) { // 1 = identical to HEAD
          const headContent = head ? await fs.readFile(file) : '';
          const workdirContent = workdir ? await fs.readFile(file) : '(deleted)';
          output += `--- a/${file}\n+++ b/${file}\n`;
          if (headContent && workdirContent !== '(deleted)') {
            // Simple line-by-line diff
            const headLines = headContent.split('\n');
            const workdirLines = workdirContent.split('\n');
            const maxLen = Math.max(headLines.length, workdirLines.length);
            for (let i = 0; i < maxLen; i++) {
              const h = headLines[i];
              const w = workdirLines[i];
              if (h !== w) {
                if (h !== undefined) output += `- ${h}\n`;
                if (w !== undefined) output += `+ ${w}\n`;
              }
            }
          } else if (!headContent && workdirContent !== '(deleted)') {
            output += `+ ${workdirContent}\n`;
          } else if (headContent && workdirContent === '(deleted)') {
            output += `- ${headContent}\n`;
          }
        }
      }
      return { success: true, output: output || 'No changes' };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Git diff failed' };
    }
  },
};

export const gitBranchTool: Tool = {
  name: 'git_branch',
  description: 'List, create, or delete Git branches',
  parameters: {
    type: 'object',
    properties: {
      path: { type: 'string', description: 'Repository path' },
      action: { type: 'string', enum: ['list', 'create', 'delete'], description: 'Action to perform' },
      branch: { type: 'string', description: 'Branch name (required for create/delete)' },
      checkout: { type: 'boolean', description: 'Whether to checkout the new branch (for create)' },
    },
    required: ['path', 'action'],
  },
  execute: async (args): Promise<ToolResult> => {
    try {
      const { path, action, branch, checkout = false } = args as { path: string; action: string; branch?: string; checkout?: boolean };
      
      if (action === 'list') {
        const branches = await git.listBranches({ fs, dir: path });
        return { success: true, output: branches };
      } else if (action === 'create') {
        if (!branch) return { success: false, error: 'Branch name required for create' };
        await git.branch({ fs, dir: path, ref: branch, checkout });
        return { success: true, output: `Branch ${branch} created` };
      } else if (action === 'delete') {
        if (!branch) return { success: false, error: 'Branch name required for delete' };
        await git.deleteBranch({ fs, dir: path, ref: branch });
        return { success: true, output: `Branch ${branch} deleted` };
      }
      return { success: false, error: 'Invalid action' };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Git branch failed' };
    }
  },
};

export const gitStatusTool: Tool = {
  name: 'git_status',
  description: 'Show Git working tree status',
  parameters: {
    type: 'object',
    properties: {
      path: { type: 'string', description: 'Repository path' },
    },
    required: ['path'],
  },
  execute: async (args): Promise<ToolResult> => {
    try {
      const { path } = args as { path: string };
      const status = await git.statusMatrix({ fs, dir: path });
      return { success: true, output: status };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Git status failed' };
    }
  },
};

export const gitTools = [
  gitInitTool,
  gitAddTool,
  gitCommitTool,
  gitLogTool,
  gitDiffTool,
  gitBranchTool,
  gitStatusTool,
];