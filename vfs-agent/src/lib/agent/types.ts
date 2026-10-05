export interface Tool {
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, any>;
    required: string[];
  };
  execute: (args: Record<string, any>) => Promise<ToolResult>;
}

export interface ToolResult {
  success: boolean;
  output?: any;
  error?: string;
}

export interface AgentStep {
  type: 'thought' | 'action' | 'observation';
  content: string;
  toolName?: string;
  toolArgs?: Record<string, any>;
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
  execute: (name: string, args: Record<string, any>) => Promise<ToolResult>;
}