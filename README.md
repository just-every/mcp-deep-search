# MCP Deep Search

[![npm version](https://badge.fury.io/js/%40just-every%2Fmcp-deep-search.svg)](https://www.npmjs.com/package/@just-every/mcp-deep-search)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

MCP server for deep web search using [@just-every/search](https://github.com/just-every/search). Search across multiple providers including Google, Bing, Brave, DuckDuckGo, Perplexity, and more.

## Quick Start

### 1. Create `.llm.env` file

```bash
# Download example env file
curl -o ~/.llm.env https://raw.githubusercontent.com/just-every/mcp-deep-search/main/.env.example

# Edit with your API keys
nano ~/.llm.env
```

### 2. Install

#### Claude Code
```bash
claude mcp add deep-search -s user -- npx -y @just-every/mcp-deep-search -e ENV_FILE=$HOME/.llm.env
```

#### Other MCP Clients
Add to your MCP configuration:
```json
{
  "mcpServers": {
    "deep-search": {
      "command": "npx",
      "args": ["-y", "@just-every/mcp-deep-search"],
      "env": {
        "ENV_FILE": "/path/to/.llm.env"
      }
    }
  }
}
```

## MCP Tools

### `deep_search`
Perform web searches using a specific provider.

**Parameters:**
- `query` (required): The search query
- `provider`: Search provider (default: brave)
- `maxResults`: Maximum results (default: 10)
- `includeAnswer`: Include AI answer if available (default: false)

### `comprehensive_research`
Perform comprehensive research using AI agents that intelligently select and query multiple search engines.

**Parameters:**
- `query` (required): The research topic
- `modelClass`: AI model class (default: reasoning_mini)

## Search Providers

| Provider | API Key Required | Description |
|----------|-----------------|-------------|
| `brave` | `BRAVE_API_KEY` | Privacy-first search with structured results |
| `anthropic` | `ANTHROPIC_API_KEY` | Deep multi-hop research |
| `openai` | `OPENAI_API_KEY` | ChatGPT-grade contextual search |
| `google` | `GOOGLE_API_KEY` | Gemini grounding search |
| `sonar` / `sonar-pro` | `OPENROUTER_API_KEY` | Perplexity search variants |
| `xai` | `XAI_API_KEY` | Real-time Grok search |

## CLI Usage

```bash
# Basic search
mcp-deep-search search "your query"

# Search with specific provider
mcp-deep-search search "your query" -p brave

# Get more results
mcp-deep-search search "your query" -n 20
```

## Getting API Keys

- **Brave**: [brave.com/search/api](https://brave.com/search/api/)
- **Anthropic**: [console.anthropic.com](https://console.anthropic.com/)
- **OpenAI**: [platform.openai.com](https://platform.openai.com/)
- **Google**: [makersuite.google.com](https://makersuite.google.com/)
- **OpenRouter**: [openrouter.ai](https://openrouter.ai/)
- **xAI**: [x.ai](https://x.ai/)

## License

MIT © Just Every