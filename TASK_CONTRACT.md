# TASK CONTRACT (immutable product obligation)

**Original request:** Build a client-side AI agent in Next.js (App Router) that can:

1. **Core Agent Loop**: Implement a ReAct-style agent that can reason, plan, and execute file operations in a virtual filesystem (VFS). The agent should accept a natural language task and autonomously create/modify files to complete it.

2. **Virtual File System (VFS)**: Full client-side VFS with:
   - Directory/file tree structure (create, read, write, delete, move, list)
   - In-memory persistence with IndexedDB backup
   - File content editing with syntax highlighting
   - Drag-and-drop file upload/download
   - ZIP import/export

3. **WASM Tool Integration**: Bundle and expose client-side WASM runtimes:
   - Python (Pyodide) for data processing, scripting
   - SQLite (sql.js) for structured data
   - FFmpeg.wasm for media processing
   - Git (isomorphic-git) for version control
   - Each tool callable from the agent via a unified tool registry

4. **Agent Capabilities**:
   - File operations: write_file, read_file, edit_file, delete_file, move_file, list_files
   - Code execution: run_python, run_sql, run_ffmpeg
   - Version control: git init, add, commit, log, diff, branch
   - Web search and fetch (via proxy/API)
   - Image generation placeholder

5. **UI/UX**:
   - Split-pane layout: chat/agent panel + VFS explorer + file editor + terminal/output
   - Monaco Editor for code editing with TS/JS/HTML/CSS/Python/SQL support
   - Real-time agent reasoning display (thought/action/observation)
   - File tree with context menus
   - Live preview iframe for generated sites
   - Dark/light theme with modern design (style-clean or style-professional)

6. **Technical Stack**:
   - Next.js 14+ App Router, TypeScript, React 18
   - Tailwind CSS + shadcn/ui components
   - Monaco Editor (@monaco-editor/react)
   - Pyodide, sql.js, @ffmpeg/ffmpeg, isomorphic-git via dynamic imports
   - IndexedDB (idb) for persistence
   - Zustand for state management

7. **Quality Bar**:
   - TypeScript strict mode, ESLint, Prettier
   - No console errors in production build
   - Responsive down to 768px
   - Accessible (keyboard nav, ARIA labels, contrast)
   - Build passes on GitHub Actions
   - Deployable to Cloudflare Pages (static export)

8. **Deliverables**:
   - Working Next.js app at vfs-agent.newera.page.dev
   - Agent can create a complete multi-page site (index.html, styles.css, app.js) from a prompt like "make a todo app"
   - All WASM tools load and execute in browser
   - VFS persists across reloads
   - Clean git history with meaningful commits
**Normalized interpretation:** Build a client-side AI agent in Next.js (App Router) that can:; Core Agent Loop**: Implement a ReAct-style agent that can reason, plan, and execute file operations in a virtual filesystem (VFS).; The agent should accept a natural language task and autonomously create/modify files to complete it.; Virtual File System (VFS)**: Full client-side VFS with:; Directory/file tree structure (create, read, write, delete, move, list); In-memory persistence with IndexedDB backup; File content editing with syntax highlighting; Drag-and-drop file upload/download; ZIP import/export; WASM Tool Integration**: Bundle and expose client-side WASM runtimes:; Python (Pyodide) for data processing, scripting; SQLite (sql.js) for structured data; FFmpeg.wasm for media processing; Git (isomorphic-git) for version control; Each tool callable from the agent via a unified tool registry; Agent Capabilities**:; File operations: write_file, read_file, edit_file, delete_file, move_file, list_files; Code execution: run_python, run_sql, run_ffmpeg; Version control: git init, add, commit, log, diff, branch; Web search and fetch (via proxy/API)
**Execution profile:** marathon
**Created:** 2026-10-05T10:33:43.492Z

## Requirements

| ID | Description | Mandatory | Status | Evidence | Acceptance Criteria |
|----|-------------|-----------|--------|----------|---------------------|
| REQ-001 | Build a client-side AI agent in Next.js (App Router) that can: | YES | pending | — | A relevant build or static verification passed after the latest relevant edit. |
| REQ-002 | Core Agent Loop**: Implement a ReAct-style agent that can reason, plan, and execute file operations in a virtual filesystem (VFS). | YES | pending | — | The requested file or implementation exists and its relevant contents were inspected. |
| REQ-003 | The agent should accept a natural language task and autonomously create/modify files to complete it. | YES | pending | — | Concrete implementation evidence is recorded and the outcome matches the user request. |
| REQ-004 | Virtual File System (VFS)**: Full client-side VFS with: | YES | pending | — | The requested file or implementation exists and its relevant contents were inspected. |
| REQ-005 | Directory/file tree structure (create, read, write, delete, move, list) | YES | pending | — | The requested file or implementation exists and its relevant contents were inspected. |
| REQ-006 | In-memory persistence with IndexedDB backup | YES | pending | — | Concrete implementation evidence is recorded and the outcome matches the user request. |
| REQ-007 | File content editing with syntax highlighting | YES | pending | — | The requested file or implementation exists and its relevant contents were inspected. |
| REQ-008 | Drag-and-drop file upload/download | YES | pending | — | The requested file or implementation exists and its relevant contents were inspected. |
| REQ-009 | ZIP import/export | YES | pending | — | Concrete implementation evidence is recorded and the outcome matches the user request. |
| REQ-010 | WASM Tool Integration**: Bundle and expose client-side WASM runtimes: | YES | pending | — | Concrete implementation evidence is recorded and the outcome matches the user request. |
| REQ-011 | Python (Pyodide) for data processing, scripting | YES | pending | — | Concrete implementation evidence is recorded and the outcome matches the user request. |
| REQ-012 | SQLite (sql.js) for structured data | YES | pending | — | Concrete implementation evidence is recorded and the outcome matches the user request. |
| REQ-013 | FFmpeg.wasm for media processing | YES | pending | — | Concrete implementation evidence is recorded and the outcome matches the user request. |
| REQ-014 | Git (isomorphic-git) for version control | YES | pending | — | Concrete implementation evidence is recorded and the outcome matches the user request. |
| REQ-015 | Each tool callable from the agent via a unified tool registry | YES | pending | — | Concrete implementation evidence is recorded and the outcome matches the user request. |
| REQ-016 | Agent Capabilities**: | YES | pending | — | Concrete implementation evidence is recorded and the outcome matches the user request. |
| REQ-017 | File operations: write_file, read_file, edit_file, delete_file, move_file, list_files | YES | pending | — | The requested file or implementation exists and its relevant contents were inspected. |
| REQ-018 | Code execution: run_python, run_sql, run_ffmpeg | YES | pending | — | Concrete implementation evidence is recorded and the outcome matches the user request. |
| REQ-019 | Version control: git init, add, commit, log, diff, branch | YES | pending | — | Concrete implementation evidence is recorded and the outcome matches the user request. |
| REQ-020 | Web search and fetch (via proxy/API) | YES | pending | — | Concrete implementation evidence is recorded and the outcome matches the user request. |

## Feature Matrix
- Build a client-side AI agent in Next.js (App Router) that can:
- Core Agent Loop**: Implement a ReAct-style agent that can reason, plan, and execute file operations in a virtual filesystem (VFS).
- The agent should accept a natural language task and autonomously create/modify files to complete it.
- Virtual File System (VFS)**: Full client-side VFS with:
- Directory/file tree structure (create, read, write, delete, move, list)
- In-memory persistence with IndexedDB backup
- File content editing with syntax highlighting
- Drag-and-drop file upload/download
- ZIP import/export
- WASM Tool Integration**: Bundle and expose client-side WASM runtimes:
- Python (Pyodide) for data processing, scripting
- SQLite (sql.js) for structured data
- FFmpeg.wasm for media processing
- Git (isomorphic-git) for version control
- Each tool callable from the agent via a unified tool registry
- Agent Capabilities**:
- File operations: write_file, read_file, edit_file, delete_file, move_file, list_files
- Code execution: run_python, run_sql, run_ffmpeg
- Version control: git init, add, commit, log, diff, branch
- Web search and fetch (via proxy/API)

## Test Matrix
- Build a client-side AI agent in Next.js (App Router) that can:

## Artifact Matrix
- Downloadable project archive

## Platform Requirements
- Web

## Completion: 0/20 mandatory requirements have evidence
