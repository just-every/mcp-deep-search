# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MCP server for deep web search using @just-every/search. Provides both CLI and MCP interfaces for searching across multiple providers including Google, Bing, Brave, DuckDuckGo, and more.

## Core Modules & Files

- `src/serve.ts`: MCP server using SDK
- `src/index.ts`: CLI interface using Commander
- `src/types.d.ts`: TypeScript definitions
- Uses @just-every/search for all search functionality

## Commands

### Development
```bash
npm run dev search "query"           # Search via CLI
npm run dev search "query" -p brave  # Use specific provider
npm run serve:dev                    # Run MCP server in dev mode
```

### Build & Production
```bash
npm run build                        # Compile TypeScript to JavaScript
npm run start                        # Run compiled CLI
npm run serve                        # Run compiled MCP server
```

### Code Quality
```bash
npm run lint                         # Run ESLint
npm run typecheck                    # TypeScript type checking
npm test                             # Run tests with Vitest
```

## Architecture Overview

A TypeScript-based MCP server that wraps @just-every/search to provide web search capabilities through the Model Context Protocol.

### Core Components

1. **MCP Server** (`src/serve.ts`)
   - SDK-based MCP implementation
   - Exposes `deep_search` tool
   - Formats search results for AI consumption
   - Supports multiple search providers

2. **CLI Interface** (`src/index.ts`)
   - Commander-based command line tool
   - Search command with provider selection
   - JSON output option
   - AI answer support

### Key Patterns

- Environment variables for API keys
- Async/await for all operations
- Proper error handling
- Minimal dependencies

## Pre-Commit Requirements

**IMPORTANT**: Always run these commands before committing:

```bash
npm test          # Ensure tests pass
npm run lint      # Check linting
npm run build     # Ensure TypeScript compiles
```

Only commit if all commands succeed without errors.

## TypeScript Configuration

- ES Modules with Node.js >=20.0.0
- Strict mode enabled, targeting ES2022
- Source maps for debugging
- Declaration files for type safety

## Code Style Guidelines

- Async/await for all asynchronous operations
- Proper error handling with detailed messages
- Environment variable usage for API keys
- Minimal dependencies for fast installs

## Testing Instructions

- Run tests with `npm test`
- Test different search providers
- Verify API key handling
- Test error scenarios

## Repository Etiquette

- Branch names: `feature/description`, `fix/issue-number`
- Conventional commits (`feat:`, `fix:`, `chore:`)
- Update README for user-facing changes
- Document any new search providers

## Developer Environment Setup

1. Clone repository
2. Install Node.js 20.x or higher
3. Run `npm install`
4. Create `.env` file with API keys
5. Run `npm run dev` for development

## Package Management

- @just-every/search is the main dependency
- Keep dependencies minimal
- Document any new dependencies
- Monitor bundle size

## Project-Specific Warnings

- **API Keys**: Ensure API keys are properly configured
- **Rate Limits**: Be aware of provider rate limits
- **Error Handling**: Some providers may fail - handle gracefully
- **Provider Support**: Not all providers support all features

## Key APIs

- `search()`: Main search function from @just-every/search
- Provider options: google, bing, brave, duckduckgo, perplexity, exa, serper, tavily
- Support for AI answers (provider-dependent)

## MCP Server Integration

When running as MCP server (`npm run serve`):

**Tools:**
- `deep_search` - Perform web searches with multiple providers

**Features:**
- Multiple search providers
- AI-generated answers (when supported)
- Configurable result limits
- Formatted output for AI consumption

## Troubleshooting

### Common Issues

- **Missing API keys**: Check .env file
- **Provider errors**: Some providers may be temporarily unavailable
- **Rate limiting**: Reduce request frequency
- **Invalid queries**: Check query formatting

### Debug Mode

Enable verbose logging:
```bash
DEBUG=* npm run dev search "query"
```
# important-instruction-reminders
Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.