import { AgentStep, AgentState, Tool, ToolResult } from './types';
import { toolRegistry } from './registry';
import { fileTools } from './tools/file-tools';

// Register file tools
fileTools.forEach((tool) => toolRegistry.register(tool));

const SYSTEM_PROMPT = `You are an AI agent that can perform file operations in a virtual filesystem.
You have access to the following tools:
{{tools}}

When given a task, reason through it step by step using the ReAct pattern:
1. THOUGHT: Analyze the task and plan your approach
2. ACTION: Call a tool with specific arguments
3. OBSERVATION: Review the tool result
4. Repeat until the task is complete

Always respond in this exact format:
THOUGHT: <your reasoning>
ACTION: <tool_name>({<json_arguments>})
OBSERVATION: <tool_result>

When the task is complete, end with:
THOUGHT: Task completed
ACTION: finish({})
OBSERVATION: <summary of what was accomplished>`;

export class Agent {
  private state: AgentState = {
    steps: [],
    isRunning: false,
    currentTask: null,
  };

  private onStepCallback?: (step: AgentStep) => void;

  constructor(onStep?: (step: AgentStep) => void) {
    this.onStepCallback = onStep;
  }

  private addStep(step: AgentStep): void {
    this.state.steps.push(step);
    this.onStepCallback?.(step);
  }

  private getToolsDescription(): string {
    const tools = toolRegistry.getAll();
    return tools
      .map((t) => `- ${t.name}: ${t.description}\n  Parameters: ${JSON.stringify(t.parameters, null, 2)}`)
      .join('\n\n');
  }

  async run(task: string): Promise<AgentStep[]> {
    this.state.isRunning = true;
    this.state.currentTask = task;
    this.state.steps = [];

    const prompt = SYSTEM_PROMPT.replace('{{tools}}', this.getToolsDescription());
    
    // In a real implementation, this would call an LLM
    // For now, we'll simulate the agent loop with a simple executor
    await this.executeTask(task);

    this.state.isRunning = false;
    return this.state.steps;
  }

  private async executeTask(task: string): Promise<void> {
    // This is a simplified executor that parses the task and executes tools
    // In production, this would be replaced with actual LLM calls
    
    // For demo purposes, we'll create a simple task parser
    const steps = this.parseTask(task);
    
    for (const step of steps) {
      if (step.type === 'thought') {
        this.addStep({
          type: 'thought',
          content: step.content,
          timestamp: Date.now(),
        });
      } else if (step.type === 'action') {
        this.addStep({
          type: 'action',
          content: `Calling ${step.toolName}`,
          toolName: step.toolName,
          toolArgs: step.toolArgs,
          timestamp: Date.now(),
        });

        const result = await toolRegistry.execute(step.toolName!, step.toolArgs || {});

        this.addStep({
          type: 'observation',
          content: result.success ? `Success: ${JSON.stringify(result.output)}` : `Error: ${result.error}`,
          toolName: step.toolName,
          timestamp: Date.now(),
        });

        if (!result.success) {
          throw new Error(result.error || 'Tool execution failed');
        }
      }
    }

    this.addStep({
      type: 'thought',
      content: 'Task completed',
      timestamp: Date.now(),
    });
  }

  private parseTask(task: string): Array<{ type: 'thought' | 'action'; content: string; toolName?: string; toolArgs?: Record<string, any> }> {
    // Simple task parser for demo - in production this would be LLM-driven
    const steps: Array<{ type: 'thought' | 'action'; content: string; toolName?: string; toolArgs?: Record<string, any> }> = [];
    
    steps.push({ type: 'thought', content: `Analyzing task: ${task}` });
    
    // Example: if task mentions creating a file
    if (task.toLowerCase().includes('create') && task.toLowerCase().includes('file')) {
      steps.push({ type: 'thought', content: 'Task involves creating a file. I will use write_file tool.' });
      // Extract filename and content from task (simplified)
      const fileNameMatch = task.match(/['"]([^'"]+)['"]/);
      const fileName = fileNameMatch ? fileNameMatch[1] : 'new-file.txt';
      const contentMatch = task.match(/content[:\s]+['"]([^'"]+)['"]/i);
      const content = contentMatch ? contentMatch[1] : 'Hello, World!';
      
      steps.push({
        type: 'action',
        content: `Creating file ${fileName}`,
        toolName: 'write_file',
        toolArgs: { path: `/${fileName}`, content },
      });
    }
    
    if (task.toLowerCase().includes('list') || task.toLowerCase().includes('show')) {
      steps.push({ type: 'thought', content: 'Task involves listing files. I will use list_files tool.' });
      steps.push({
        type: 'action',
        content: 'Listing root directory',
        toolName: 'list_files',
        toolArgs: { path: '/' },
      });
    }

    return steps;
  }

  getState(): AgentState {
    return { ...this.state };
  }

  reset(): void {
    this.state = {
      steps: [],
      isRunning: false,
      currentTask: null,
    };
  }
}

export const agent = new Agent();