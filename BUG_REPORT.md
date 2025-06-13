# Bug Report: Environment Variables Not Being Read at Runtime

## Affected Packages
- @just-every/search v1.0.5
- @just-every/ensemble v0.2.60

## Description
All search providers except Brave fail to read their API keys from environment variables when loaded via dotenv at runtime. The issue appears to be in the @just-every/ensemble package, which checks for environment variables at module initialization time rather than at function call time.

## Steps to Reproduce

1. Create a `.env` file with API keys:
```
BRAVE_API_KEY=your-brave-key
ANTHROPIC_API_KEY=your-anthropic-key
OPENAI_API_KEY=your-openai-key
GOOGLE_API_KEY=your-google-key
OPENROUTER_API_KEY=your-openrouter-key
XAI_API_KEY=your-xai-key
```

2. Create a test script that loads env vars with dotenv:
```javascript
import * as dotenv from 'dotenv';
dotenv.config();

import { web_search } from '@just-every/search';

// Test each provider
const providers = ['brave', 'anthropic', 'openai', 'google', 'sonar', 'xai'];

for (const provider of providers) {
  try {
    const results = await web_search(provider, 'test query', 2);
    console.log(`${provider}: Success`);
  } catch (error) {
    console.log(`${provider}: Failed - ${error.message}`);
  }
}
```

3. Run the script: `node test.js`

## Expected Behavior
All providers should successfully read their API keys from process.env and execute searches.

## Actual Behavior
- **Brave provider**: ✅ Works correctly - reads BRAVE_API_KEY from environment
- **All other providers**: ❌ Fail with API key errors

### Error Messages
- **Anthropic**: `Error: max_tokens must be greater than thinking.budget_tokens` (appears to be using extended thinking feature incorrectly)
- **OpenAI**: `Error: Failed to initialize OpenAI client. Make sure OPENAI_API_KEY is set.`
- **Google**: `Error: Failed to initialize Gemini client. GOOGLE_API_KEY is missing or not provided.`
- **OpenRouter/Sonar**: `Error: Failed to initialize OpenAI client for openrouter. API key is missing.`
- **XAI**: `Error: Failed to initialize OpenAI client for xai. API key is missing.`

## Root Cause Analysis
The issue is in @just-every/ensemble's provider implementations. They appear to check for environment variables at module load time rather than when creating client instances. This prevents dynamic loading of environment variables.

For example, in the error stack traces, we see:
```
at ClaudeProvider.get client (/node_modules/@just-every/ensemble/dist/model_providers/claude.js:238:23)
at GeminiProvider.get client (/node_modules/@just-every/ensemble/dist/model_providers/gemini.js:323:23)
```

These getters are likely checking `process.env.ANTHROPIC_API_KEY` at module initialization rather than at runtime.

## Workaround
Currently, the only workaround is to set environment variables before starting the Node process:
```bash
OPENAI_API_KEY=your-key ANTHROPIC_API_KEY=your-key node script.js
```

This is not ideal for applications that need to load configuration from .env files or other dynamic sources.

## Suggested Fix
The provider classes in @just-every/ensemble should check for environment variables when the client getter is called, not at module initialization. For example:

```javascript
// Current (problematic) approach - checks at module load
class ClaudeProvider {
  constructor() {
    this.apiKey = process.env.ANTHROPIC_API_KEY; // Checked too early
  }
  
  get client() {
    if (!this.apiKey) {
      throw new Error('Failed to initialize Claude client. Make sure ANTHROPIC_API_KEY is set.');
    }
    // ...
  }
}

// Suggested fix - check at runtime
class ClaudeProvider {
  get client() {
    const apiKey = process.env.ANTHROPIC_API_KEY; // Check when needed
    if (!apiKey) {
      throw new Error('Failed to initialize Claude client. Make sure ANTHROPIC_API_KEY is set.');
    }
    // ...
  }
}
```

## Environment
- Node.js: v23.9.0
- @just-every/search: v1.0.5
- @just-every/ensemble: v0.2.60
- OS: macOS Darwin 24.5.0

## Impact
This bug prevents MCP servers and other applications from using search providers with dynamically loaded configuration, which is a common pattern in Node.js applications.

## Additional Notes
- The Brave provider in @just-every/search v1.0.6 works correctly, suggesting it's implemented differently than the LLM-based providers
- With v1.0.6, most environment variable issues are fixed, but:
  - Anthropic has a new error about `max_tokens` vs `thinking.budget_tokens`
  - OpenRouter/Perplexity providers still have env var issues
- LLM providers (OpenAI, Google, XAI) now work but return conversational text instead of structured search results