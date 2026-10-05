# VFS Agent

A fully client-side AI agent with virtual file system, WASM tools, and live preview - all running in your browser.

## Features

### 🗂️ Virtual File System
- Full CRUD operations (create, read, update, delete, move, list)
- Directory tree with nested folders
- File metadata (size, timestamps, type)
- In-memory performance with IndexedDB persistence

### 🤖 ReAct Agent Loop
- Reasoning + Acting cycle
- Tool registry with 15+ built-in tools
- Streaming responses
- Error recovery and retry logic

### ⚡ WASM-Powered Tools
| Tool | Runtime | Description |
|------|---------|-------------|
| `run_python` | Pyodide | Python 3.12 with NumPy, Pandas, Matplotlib |
| `run_sql` | sql.js | SQLite database engine |
| `run_ffmpeg` | FFmpeg.wasm | Video/audio processing |
| `git_*` | isomorphic-git | Full Git operations |
| `web_search` | Fetch API | Web search via Tavily |
| `web_fetch` | Fetch API | HTTP requests and scraping |
| `generate_image` | Control plane | AI image generation |
| `file_*` | VFS (JS) | File management |

### 🎨 Developer Experience
- **Monaco Editor** - VS Code's editor in-browser
- **Split-pane layout** - Resizable panels
- **Live preview** - Iframe for HTML/CSS/JS
- **Dark/Light theme** - System-aware with persistence
- **Integrated terminal** - Command output panel
- **ZIP import/export** - Drag-drop project portability

## Getting Started

```bash
# Install dependencies
npm install

# Development server
npm run dev

# Production build
npm run build

# Preview production build
npx serve out
```

## Architecture

```
┌─────────────────────────────────────┐
│         Browser Tab                 │
├─────────────────────────────────────┤
│  ┌─────────┐ ┌───────────────────┐  │
│  │ Explorer│ │     Editor        │  │
│  │  (VFS)  │ │   (Monaco)        │  │
│  └─────────┘ └───────────────────┘  │
│  ┌─────────┐ ┌───────────────────┐  │
│  │  Chat   │ │    Terminal       │  │
│  │ (Agent) │ │   (Output)        │  │
│  └─────────┘ └───────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │      Preview (iframe)         │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
         │              │
         ▼              ▼
    ┌─────────┐   ┌───────────┐
    │IndexedDB│   │  WASM     │
    │ (VFS)   │   │  Tools    │
    └─────────┘   └───────────┘
```

## VFS Structure

```
/
├── demo-site.html      # Home page
├── about.html          # Architecture details
├── features.html       # Feature deep-dive
├── contact.html        # Contact form
├── scripts/
│   ├── analyze.py      # Python data analysis
│   ├── query.sql       # SQLite queries
│   └── process.sh      # FFmpeg commands
└── assets/
    ├── style.css
    └── logo.svg
```

## Agent Tools

### File Operations
- `write_file(path, content)` - Create or overwrite file
- `read_file(path)` - Read file content
- `edit_file(path, find, replace)` - Edit file content
- `delete_file(path)` - Delete file or directory
- `move_file(from, to)` - Move/rename file
- `list_files(path)` - List directory contents

### Code Execution
- `run_python(code, packages?)` - Execute Python with optional PyPI packages
- `run_sql(sql, database?)` - Execute SQLite queries
- `run_ffmpeg(args)` - Run FFmpeg commands

### Git Operations
- `git_init(path)` - Initialize repository
- `git_add(path, files)` - Stage files
- `git_commit(path, message)` - Create commit
- `git_log(path)` - View commit history
- `git_diff(path, commit1, commit2)` - Show differences
- `git_branch(path, name?)` - List or create branches
- `git_status(path)` - Show working tree status

### Web Tools
- `web_search(query)` - Search the web
- `web_fetch(url)` - Fetch URL content
- `generate_image(prompt, path, size?)` - Generate AI images

## Configuration

### next.config.ts
```typescript
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'export',
  images: { unoptimized: true },
  webpack: (config) => {
    config.experiments = { asyncWebAssembly: true }
    return config
  }
}
export default nextConfig
```

## Deployment

Static export to `out/` directory. Deploy to any static host:

- Vercel: `vercel --prod out`
- Netlify: Drag `out` folder
- GitHub Pages: Push `out` to `gh-pages` branch
- Cloudflare Pages: Connect repo, build command `npm run build`

## Privacy

- **No server required** - Runs entirely in browser
- **No API keys** for local tools (Python, SQLite, FFmpeg, Git)
- **Local storage** - IndexedDB for files, localStorage for settings
- **Offline capable** - Works after initial load
- **No telemetry** - Zero tracking

## License

MIT License - See LICENSE file for details.

---

Built with Next.js 16, React 19, TypeScript, Tailwind CSS 4, and ❤️