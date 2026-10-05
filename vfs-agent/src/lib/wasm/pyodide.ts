import { Tool, ToolResult } from '@/lib/agent/types';

let pyodide: any = null;
let isLoading = false;
let loadPromise: Promise<any> | null = null;

async function getPyodide() {
  if (pyodide) return pyodide;
  if (loadPromise) return loadPromise;
  
  isLoading = true;
  loadPromise = (async () => {
    try {
      // Dynamic import to avoid SSR issues
      const { loadPyodide } = await import('pyodide');
      pyodide = await loadPyodide({
        indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.26.2/full/',
      });
      return pyodide;
    } catch (error) {
      console.error('Failed to load Pyodide:', error);
      throw error;
    } finally {
      isLoading = false;
    }
  })();
  
  return loadPromise;
}

export const runPythonTool: Tool = {
  name: 'run_python',
  description: 'Execute Python code using Pyodide WASM runtime',
  parameters: {
    type: 'object',
    properties: {
      code: { type: 'string', description: 'Python code to execute' },
      packages: { 
        type: 'array', 
        items: { type: 'string' },
        description: 'Additional PyPI packages to install (e.g., ["numpy", "pandas"])' 
      },
    },
    required: ['code'],
  },
  execute: async (args): Promise<ToolResult> => {
    try {
      const { code, packages = [] } = args;
      const py = await getPyodide();
      
      // Install additional packages if needed
      for (const pkg of packages) {
        await py.loadPackage(pkg);
      }
      
      // Capture stdout/stderr
      let output = '';
      let error = '';
      
      py.setStdout({ batched: (txt: string) => { output += txt; } });
      py.setStderr({ batched: (txt: string) => { error += txt; } });
      
      const result = await py.runPythonAsync(code);
      
      return {
        success: true,
        output: {
          result,
          stdout: output,
          stderr: error,
        },
      };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Python execution failed' };
    }
  },
};

export async function initializePyodide(): Promise<void> {
  await getPyodide();
}