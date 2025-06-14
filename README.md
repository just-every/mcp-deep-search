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

### Quick Start with Environment Variables

You have three options for configuring API keys:

1. **Using a .env file** (Recommended)
2. **Inline environment variables** in MCP configuration
3. **System environment variables**

### Option 1: Using .env File (Recommended)

First, create a `.env` file in your project directory:

```bash
# Download the example .env file
curl -o .env https://raw.githubusercontent.com/just-every/mcp-deep-search/main/.env.example

# Or create manually
cat > .env << 'EOF'
BRAVE_API_KEY=your-brave-key
ANTHROPIC_API_KEY=your-anthropic-key
OPENAI_API_KEY=your-openai-key
GOOGLE_API_KEY=your-google-key
OPENROUTER_API_KEY=your-openrouter-key
XAI_API_KEY=your-xai-key
EOF
```

Then install using your preferred method:

#### Claude Code

```bash
claude mcp add deep-search -s user -- npx -y @just-every/mcp-deep-search
```

#### VS Code

```bash
code --add-mcp '{"name":"deep-search","command":"npx","args":["-y","@just-every/mcp-deep-search"]}'
```

#### Cursor

```bash
cursor://anysphere.cursor-deeplink/mcp/install?name=deep-search&config=eyJkZWVwLXNlYXJjaCI6eyJjb21tYW5kIjoibnB4IiwiYXJncyI6WyIteSIsIkBqdXN0LWV2ZXJ5L21jcC1kZWVwLXNlYXJjaCJdfX0=
```

#### JetBrains IDEs

Settings → Tools → AI Assistant → Model Context Protocol (MCP) → Add

Choose "As JSON" and paste:

```json
{"command":"npx","args":["-y","@just-every/mcp-deep-search"]}
```

### Option 2: Inline Environment Variables

You can specify environment variables directly in your MCP configuration:

```json
{
  "mcpServers": {
    "deep-search": {
      "command": "npx",
      "args": ["-y", "@just-every/mcp-deep-search"],
      "env": {
        "BRAVE_API_KEY": "your-brave-key",
        "ANTHROPIC_API_KEY": "your-anthropic-key",
        "OPENAI_API_KEY": "your-openai-key",
        "GOOGLE_API_KEY": "your-google-key",
        "OPENROUTER_API_KEY": "your-openrouter-key",
        "XAI_API_KEY": "your-xai-key"
      }
    }
  }
}
```

Drop this into your client's mcp.json (e.g. `.vscode/mcp.json`, `~/.cursor/mcp.json`, or `.mcp.json` for Claude).

### Option 3: System Environment Variables

Export the variables in your shell:

```bash
export BRAVE_API_KEY="your-brave-key"
export ANTHROPIC_API_KEY="your-anthropic-key"
export OPENAI_API_KEY="your-openai-key"
# ... etc
```

Then use the standard installation commands above.

## Configuration

### Environment Variables

The server automatically loads environment variables from a `.env` file in the current directory. You only need to set API keys for the providers you plan to use:

| Variable | Provider | Required For |
|----------|----------|--------------|
| `BRAVE_API_KEY` | Brave | Brave search (recommended for structured results) |
| `ANTHROPIC_API_KEY` | Anthropic | Deep multi-hop research |
| `OPENAI_API_KEY` | OpenAI | ChatGPT-grade contextual search |
| `GOOGLE_API_KEY` | Google | Gemini grounding search |
| `OPENROUTER_API_KEY` | Perplexity | Sonar search variants |
| `XAI_API_KEY` | xAI | Real-time Grok search |

### Getting API Keys

- **Brave**: [brave.com/search/api](https://brave.com/search/api/)
- **Anthropic**: [console.anthropic.com](https://console.anthropic.com/)
- **OpenAI**: [platform.openai.com](https://platform.openai.com/)
- **Google**: [makersuite.google.com](https://makersuite.google.com/)
- **OpenRouter**: [openrouter.ai](https://openrouter.ai/)
- **xAI**: [x.ai](https://x.ai/)

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

Once installed in your IDE, the following tools are available:

#### `deep_search`

Perform deep web searches using a specific search provider.

**Parameters:**
- `query` (required): The search query
- `provider`: Search provider to use (default: brave)
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

#### `comprehensive_research`

Perform comprehensive research using multiple search engines automatically with AI agents. This tool intelligently selects appropriate search engines, runs parallel searches, and compiles a comprehensive report.

**Parameters:**
- `query` (required): The research topic or question
- `modelClass`: AI model class to use (default: reasoning_mini)
  - Options: standard, mini, reasoning, reasoning_mini, monologue, metacognition, code, writing, summary, vision, vision_mini, search, image_generation, embedding, voice

**Example:**
```javascript
{
  "tool": "comprehensive_research",
  "arguments": {
    "query": "What are the latest breakthroughs in quantum computing?",
    "modelClass": "reasoning"
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

**Current Status (v0.1.14 with latest dependencies):** 
- ✅ **Brave** - Works perfectly, returns structured search results in JSON format
- ✅ **Anthropic** - Fixed! Now works with .env files (returns conversational text with embedded search results)
- ✅ **OpenAI** - Works with .env files (returns conversational text)
- ✅ **Google** - Works with .env files (returns conversational text)
- ✅ **XAI** - Works with .env files (returns conversational text)
- ⚠️ **Perplexity (sonar)** - May still have environment variable issues

**Note:** The LLM-based providers return conversational responses rather than structured JSON. This is by design in @just-every/search v1.0.7. The Brave provider is best for structured search results.

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