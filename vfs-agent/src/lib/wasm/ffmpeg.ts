import { Tool, ToolResult } from '@/lib/agent/types';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

let ffmpeg: FFmpeg | null = null;
let isLoading = false;

async function getFFmpeg(): Promise<FFmpeg> {
  if (ffmpeg) return ffmpeg;
  if (isLoading) {
    // Wait for existing load to complete
    while (isLoading) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    return ffmpeg!;
  }
  
  isLoading = true;
  try {
    ffmpeg = new FFmpeg();
    
    // Load FFmpeg core from CDN
    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
    });
    return ffmpeg;
  } catch (error) {
    console.error('Failed to load FFmpeg:', error);
    throw error;
  } finally {
    isLoading = false;
  }
}

export const runFFmpegTool: Tool = {
  name: 'run_ffmpeg',
  description: 'Execute FFmpeg commands for media processing',
  parameters: {
    type: 'object',
    properties: {
      arguments: { 
        type: 'array', 
        items: { type: 'string' },
        description: 'FFmpeg command line arguments (e.g., ["-i", "input.mp4", "output.webm"])' 
      },
      inputFiles: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            data: { type: 'string', description: 'Base64 encoded file data' },
          },
          required: ['name', 'data'],
        },
        description: 'Input files to write to FFmpeg filesystem before execution',
      },
      outputFiles: {
        type: 'array',
        items: { type: 'string' },
        description: 'Output file names to read from FFmpeg filesystem after execution',
      },
    },
    required: ['arguments'],
  },
  execute: async (args): Promise<ToolResult> => {
    try {
      const { arguments: ffmpegArgs, inputFiles = [], outputFiles = [] } = args;
      const ff = await getFFmpeg();
      
      // Write input files to FFmpeg virtual filesystem
      for (const file of inputFiles) {
        const binaryString = atob(file.data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        await ff.writeFile(file.name, bytes);
      }
      
      // Run FFmpeg command
      await ff.exec(ffmpegArgs);
      
      // Read output files
      const outputs: Record<string, string> = {};
      for (const outputName of outputFiles) {
        try {
          const data = await ff.readFile(outputName);
          // Convert to base64
          let binary = '';
          const bytes = new Uint8Array(data);
          for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
          }
          outputs[outputName] = btoa(binary);
        } catch (e) {
          outputs[outputName] = `Error reading output: ${e}`;
        }
      }
      
      return {
        success: true,
        output: {
          files: outputs,
          message: 'FFmpeg command executed successfully',
        },
      };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'FFmpeg execution failed' };
    }
  },
};

export async function initializeFFmpeg(): Promise<void> {
  await getFFmpeg();
}