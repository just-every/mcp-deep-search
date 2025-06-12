# MCP Deep Search

[![npm version](https://badge.fury.io/js/%40just-every%2Fmcp-deep-search.svg)](https://www.npmjs.com/package/@just-every/mcp-deep-search)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

MCP server for deep web search using [@just-every/search](https://github.com/just-every/search). Provides both CLI and MCP interfaces for searching across multiple providers.

## Features

- 🔍 **Multiple Search Providers**: Google, Bing, Brave, DuckDuckGo, Perplexity, and more
- 🤖 **AI-Powered Answers**: Get AI-generated answers when supported by the provider
- 🛠️ **MCP Server**: Use as a Model Context Protocol server with Claude, Cursor, or other MCP clients
- 💻 **CLI Tool**: Command-line interface for quick searches
- 📦 **Simple Integration**: Easy to use with any MCP-compatible application

## Installation

### Claude Code

```bash
claude mcp add deep-search -s user -- npx -y @just-every/mcp-deep-search
```

### VS Code

```bash
code --add-mcp '{"name":"deep-search","command":"npx","args":["-y","@just-every/mcp-deep-search"]}'
```

### Cursor

```bash
cursor://anysphere.cursor-deeplink/mcp/install?name=deep-search&config=eyJkZWVwLXNlYXJjaCI6eyJjb21tYW5kIjoibnB4IiwiYXJncyI6WyIteSIsIkBqdXN0LWV2ZXJ5L21jcC1kZWVwLXNlYXJjaCJdfX0=
```

### JetBrains IDEs

Settings → Tools → AI Assistant → Model Context Protocol (MCP) → Add

Choose "As JSON" and paste:

```json
{"command":"npx","args":["-y","@just-every/mcp-deep-search"]}
```

### Raw JSON (works in any MCP client)

```json
{
  "mcpServers": {
    "deep-search": {
      "command": "npx",
      "args": ["-y", "@just-every/mcp-deep-search"],
      "env": {
        "OPENAI_API_KEY": "your-key",
        "GOOGLE_API_KEY": "your-key"
        // Add other API keys as needed
      }
    }
  }
}
```

Drop this into your client's mcp.json (e.g. .vscode/mcp.json, ~/.cursor/mcp.json, or .mcp.json for Claude).

## Configuration

Create a `.env` file with your API keys:

```env
OPENAI_API_KEY=your-openai-key
ANTHROPIC_API_KEY=your-anthropic-key
GOOGLE_API_KEY=your-google-key
BRAVE_API_KEY=your-brave-key
# Add other provider API keys as needed
```

## Usage

### CLI Usage

```bash
# Basic search
mcp-deep-search search "your query"

# Search with specific provider
mcp-deep-search search "your query" -p brave

# Get more results
mcp-deep-search search "your query" -n 20

# Include AI answer
mcp-deep-search search "your query" -a

# Save results to file
mcp-deep-search search "your query" -o results.json
```

### MCP Server Usage

Once installed in your IDE, the following tool is available:

#### `deep_search`

Perform deep web searches using multiple search providers.

**Parameters:**
- `query` (required): The search query
- `provider`: Search provider to use (default: google)
- `maxResults`: Maximum number of results (default: 10)
- `includeAnswer`: Include AI-generated answer if available (default: false)

**Example:**
```javascript
{
  "tool": "deep_search",
  "arguments": {
    "query": "latest AI developments",
    "provider": "brave",
    "maxResults": 10,
    "includeAnswer": true
  }
}
```

### Available Search Providers

- **brave** - Privacy-first search using Brave's independent index (requires BRAVE_API_KEY)
- **anthropic** - Deep multi-hop research with strong source citations (requires ANTHROPIC_API_KEY)
- **openai** - ChatGPT-grade contextual search (requires OPENAI_API_KEY)
- **google** - Fresh breaking-news facts via Gemini grounding (requires GOOGLE_API_KEY)
- **sonar** - Lightweight Perplexity search (requires OPENROUTER_API_KEY)
- **sonar-pro** - Advanced Perplexity search (requires OPENROUTER_API_KEY)
- **sonar-deep-research** - Expert-level Perplexity research (requires OPENROUTER_API_KEY)
- **xai** - Real-time web search via Grok (requires XAI_API_KEY)

**Note:** Each provider requires its corresponding API key to be set in the environment variables or .env file.

**Current Status (v0.1.10):** 
- ✅ Brave search provider works correctly with .env file
- ⚠️ Other providers (Anthropic, OpenAI, Google, etc.) have issues reading environment variables from .env files due to a bug in the @just-every/ensemble dependency. As a workaround, set these environment variables before running the process.

## Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev search "test query"

# Run MCP server in development
npm run serve:dev

# Build for production
npm run build

# Run tests
npm test

# Lint code
npm run lint

# Type check
npm run typecheck
```

## Architecture

```
mcp-deep-search/
├── src/
│   ├── index.ts        # CLI entry point
│   ├── serve.ts        # MCP server entry point
│   └── types.d.ts      # TypeScript definitions
```

## Prerequisites

- Node.js 20.x or higher
- npm or npx
- API keys for search providers you want to use

## License

MIT © Just Every

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Issues

If you encounter any issues with @just-every/search while using this MCP, please report them so we can fix them.