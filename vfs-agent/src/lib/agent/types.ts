export interface ToolParameters {
  type: 'object';
  properties: Record<string, unknown>;
  required: string[];
}

export interface Tool {
  name: string;
  description: string;
  parameters: ToolParameters;
  execute: (args: Record<string, unknown>) => Promise<ToolResult>;
}

export interface ToolResult {
  success: boolean;
  output?: unknown;
  error?: string;
}

export interface AgentStep {
  type: 'thought' | 'action' | 'observation';
  content: string;
  toolName?: string;
  toolArgs?: Record<string, unknown>;
  timestamp: number;
}

export interface AgentState {
  steps: AgentStep[];
  isRunning: boolean;
  currentTask: string | null;
}

export interface ToolRegistry {
  tools: Map<string, Tool>;
  register: (tool: Tool) => void;
  unregister: (name: string) => void;
  get: (name: string) => Tool | undefined;
  getAll: () => Tool[];
  execute: (name: string, args: Record<string, unknown>) => Promise<ToolResult>;
}