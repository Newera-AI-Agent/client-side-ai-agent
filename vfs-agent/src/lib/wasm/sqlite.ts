import { Tool, ToolResult } from '@/lib/agent/types';
import initSqlJs, { Database } from 'sql.js';
import type { SqlJsStatic } from 'sql.js';

let sqlJs: SqlJsStatic | null = null;
let db: Database | null = null;

async function getSqlJs(): Promise<SqlJsStatic> {
  if (sqlJs) return sqlJs;
  sqlJs = await initSqlJs({
    locateFile: (file: string) => `https://sql.js.org/dist/${file}`,
  });
  return sqlJs;
}

export async function getDatabase(): Promise<Database> {
  if (!db) {
    const SqlJs = await getSqlJs();
    db = new SqlJs.Database();
  }
  return db!;
}

export function setDatabase(newDb: Database): void {
  db = newDb;
}

export function exportDatabase(): Uint8Array {
  if (!db) throw new Error('No database initialized');
  return db.export();
}

export async function importDatabase(data: Uint8Array): Promise<void> {
  const SqlJs = await getSqlJs();
  db = new SqlJs.Database(data);
}

export const runSqlTool: Tool = {
  name: 'run_sql',
  description: 'Execute SQL queries using SQLite (sql.js) WASM runtime',
  parameters: {
    type: 'object',
    properties: {
      query: { type: 'string', description: 'SQL query to execute' },
      database: { 
        type: 'string', 
        description: 'Base64 encoded database file (optional, uses current DB if not provided)' 
      },
    },
    required: ['query'],
  },
  execute: async (args): Promise<ToolResult> => {
    try {
      const { query, database } = args as { query: string; database?: string };
      
      if (database) {
        const binaryString = atob(database);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        await importDatabase(bytes);
      }
      
      const database_instance = await getDatabase();
      const results: Array<{ columns: string[]; rows: Record<string, unknown>[] }> = [];
      
      // Split queries by semicolon
      const queries = query.split(';').filter((q: string) => q.trim());
      
      for (const q of queries) {
        const stmt = database_instance.prepare(q.trim());
        const cols = stmt.getColumnNames();
        const rows: Record<string, unknown>[] = [];
        while (stmt.step()) {
          rows.push(stmt.getAsObject() as Record<string, unknown>);
        }
        stmt.free();
        results.push({ columns: cols, rows });
      }
      
      return {
        success: true,
        output: {
          results,
          database: btoa(String.fromCharCode(...exportDatabase())),
        },
      };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'SQL execution failed' };
    }
  },
};

export const initSqliteTool: Tool = {
  name: 'init_sqlite',
  description: 'Initialize a new SQLite database or load from base64',
  parameters: {
    type: 'object',
    properties: {
      database: { 
        type: 'string', 
        description: 'Base64 encoded database file (optional)' 
      },
    },
    required: [],
  },
  execute: async (args): Promise<ToolResult> => {
    try {
      const { database } = args as { database?: string };
      const SqlJs = await getSqlJs();
      
      if (database) {
        const binaryString = atob(database);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        db = new SqlJs.Database(bytes);
      } else {
        db = new SqlJs.Database();
      }
      
      return { success: true, output: 'Database initialized' };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Failed to initialize database' };
    }
  },
};