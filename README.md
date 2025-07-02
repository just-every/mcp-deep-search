# MCP Deep Search

[![npm version](https://badge.fury.io/js/%40just-every%2Fmcp-deep-search.svg)](https://www.npmjs.com/package/@just-every/mcp-deep-search)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

MCP server for deep web search using [@just-every/search](https://github.com/just-every/search). Search across multiple providers including Google, Bing, Brave, DuckDuckGo, Perplexity, and more.

## Quick Start

### 1. Create or use an environment file

Option A: Create a new `.llm.env` file in your home directory:
```bash
# Download example env file
curl -o ~/.llm.env https://raw.githubusercontent.com/just-every/mcp-deep-search/main/.env.example

# Edit with your API keys
nano ~/.llm.env
```

Option B: Use an existing `.env` file (must use absolute path):
```bash
# Example: /Users/yourname/projects/myproject/.env
# Example: /home/yourname/workspace/.env
```

### 2. Install

#### Claude Code
```bash
# Using ~/.llm.env
claude mcp add deep-search -s user -- npx -y @just-every/mcp-deep-search --env ENV_FILE=$HOME/.llm.env

# Using existing .env file (absolute path required)
claude mcp add deep-search -s user -- npx -y @just-every/mcp-deep-search --env ENV_FILE=/absolute/path/to/your/.env

# For debugging, check if ENV_FILE is being passed correctly:
claude mcp list
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

## Troubleshooting

### MCP Server Shows "Failed" in Claude

If you see "deep-search ✘ failed" in Claude, check these common issues:

1. **Missing API Keys**: The most common issue is missing API keys. Check that your ENV_FILE is properly configured:
   ```bash
   # Test if ENV_FILE is working
   ENV_FILE=/path/to/your/.env npx @just-every/mcp-deep-search search "test"
   ```

2. **Incorrect Installation Command**: Make sure you're using `--env` not `-e`:
   ```bash
   # Correct
   claude mcp add deep-search -s user -- npx -y @just-every/mcp-deep-search --env ENV_FILE=$HOME/.llm.env
   
   # Incorrect (won't pass ENV_FILE properly)
   claude mcp add deep-search -s user -- npx -y @just-every/mcp-deep-search -e ENV_FILE=$HOME/.llm.env
   ```

3. **Path Issues**: ENV_FILE must use absolute paths:
   ```bash
   # Good
   ENV_FILE=/Users/yourname/.llm.env
   ENV_FILE=$HOME/.llm.env
   
   # Bad
   ENV_FILE=.env
   ENV_FILE=~/.llm.env  # ~ not expanded in some contexts
   ```

4. **Verify Installation**: Check your MCP configuration:
   ```bash
   claude mcp list
   ```

5. **Debug Mode**: For detailed error messages, run manually:
   ```bash
   ENV_FILE=/path/to/.env npx @just-every/mcp-deep-search
   ```

## Getting API Keys

- **Brave**: [brave.com/search/api](https://brave.com/search/api/)
- **Anthropic**: [console.anthropic.com](https://console.anthropic.com/)
- **OpenAI**: [platform.openai.com](https://platform.openai.com/)
- **Google**: [makersuite.google.com](https://makersuite.google.com/)
- **OpenRouter**: [openrouter.ai](https://openrouter.ai/)
- **xAI**: [x.ai](https://x.ai/)

## Auto-Restart Feature

The MCP server includes automatic restart capability by default for improved reliability:

- Automatically restarts the server if it crashes
- Handles unhandled exceptions and promise rejections
- Implements exponential backoff (max 10 attempts in 1 minute)
- Logs all restart attempts for monitoring
- Gracefully handles shutdown signals (SIGINT, SIGTERM)

For development/debugging without auto-restart:
```bash
# Run directly without restart wrapper
npm run serve:dev
```

## License

MIT © Just Every