export * from './file-tools';
export * from './web-tools';
import { runPythonTool } from '@/lib/wasm/pyodide';
import { runSqlTool, initSqliteTool } from '@/lib/wasm/sqlite';
import { runFFmpegTool } from '@/lib/wasm/ffmpeg';
import { gitTools } from '@/lib/wasm/git';
import { toolRegistry } from '../registry';

// Register WASM tools
toolRegistry.register(runPythonTool);
toolRegistry.register(runSqlTool);
toolRegistry.register(initSqliteTool);
toolRegistry.register(runFFmpegTool);
gitTools.forEach(tool => toolRegistry.register(tool));

import { webTools } from './web-tools';
webTools.forEach(tool => toolRegistry.register(tool));