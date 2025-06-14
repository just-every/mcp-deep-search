#!/usr/bin/env node

// Load environment variables BEFORE importing other modules
import * as dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Ensure the process doesn't exit on stdio errors
process.stdin.on('error', () => {});
process.stdout.on('error', () => {});
process.stderr.on('error', () => {});

// Check if ENV_FILE is specified
if (process.env.ENV_FILE) {
    try {
        const envPath = resolve(process.env.ENV_FILE);
        const envContent = readFileSync(envPath, 'utf-8');
        
        // Parse the env file content
        envContent.split('\n').forEach(line => {
            line = line.trim();
            if (line && !line.startsWith('#')) {
                const [key, ...valueParts] = line.split('=');
                const value = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
                if (key && value) {
                    process.env[key.trim()] = value;
                }
            }
        });
        
        console.error(`[MCP] Loaded environment from: ${envPath}`);
    } catch (error) {
        console.error(`[MCP] Failed to load ENV_FILE: ${error}`);
    }
} else {
    // Load from standard .env file if present
    dotenv.config();
}

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
    ListResourcesRequestSchema,
    ReadResourceRequestSchema,
    type Tool,
    type Resource,
} from '@modelcontextprotocol/sdk/types.js';
import { web_search, web_search_task } from '@just-every/search';

const server = new Server(
    {
        name: 'deep-search',
        version: '0.1.0',
    },
    {
        capabilities: {
            tools: {},
            resources: {},
        },
    }
);

// Add error handling for the server instance
server.onerror = error => {
    console.error('[MCP Server Error]', error);
};

// Tool definitions
const SEARCH_TOOL: Tool = {
    name: 'deep_search',
    description: 'Perform deep web searches using multiple search providers',
    inputSchema: {
        type: 'object',
        properties: {
            query: {
                type: 'string',
                description: 'The search query',
            },
            provider: {
                type: 'string',
                description:
                    'Search provider to use (e.g., google, bing, brave, etc.)',
                enum: [
                    'brave',
                    'anthropic',
                    'openai',
                    'google',
                    'sonar',
                    'sonar-pro',
                    'sonar-deep-research',
                    'xai',
                ],
            },
            maxResults: {
                type: 'number',
                description: 'Maximum number of results to return',
                default: 10,
            },
            includeAnswer: {
                type: 'boolean',
                description:
                    'Include AI-generated answer for the query (if supported by provider)',
                default: false,
            },
        },
        required: ['query'],
    },
};

const RESEARCH_TOOL: Tool = {
    name: 'comprehensive_research',
    description:
        'Perform comprehensive research using multiple search engines automatically with AI agents',
    inputSchema: {
        type: 'object',
        properties: {
            query: {
                type: 'string',
                description:
                    'The research topic or question to investigate comprehensively',
            },
            modelClass: {
                type: 'string',
                description: 'AI model class to use for research',
                enum: [
                    'standard',
                    'mini',
                    'reasoning',
                    'reasoning_mini',
                    'monologue',
                    'metacognition',
                    'code',
                    'writing',
                    'summary',
                    'vision',
                    'vision_mini',
                    'search',
                    'image_generation',
                    'embedding',
                    'voice',
                ],
                default: 'reasoning_mini',
            },
        },
        required: ['query'],
    },
};

// Resources definitions
const RESOURCES: Resource[] = [];

// Handle tool listing
server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [SEARCH_TOOL, RESEARCH_TOOL],
}));

// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, async request => {
    try {
        const args = request.params.arguments as any;

        if (request.params.name === 'deep_search') {
            console.error(
                `[MCP] Received search request for query: ${args.query}`
            );

            // Perform the search
            const resultsJson = await web_search(
                args.provider || 'brave',
                args.query,
                args.maxResults || 10
            );

            let results;

            // Check if the response is an error
            if (resultsJson.startsWith('Error:')) {
                throw new Error(resultsJson);
            }

            // Try to parse as JSON
            try {
                results = JSON.parse(resultsJson);
                // Handle the new format where results are directly an array
                if (Array.isArray(results)) {
                    results = { results: results };
                }
            } catch {
                // If not JSON, treat as plain text answer
                results = {
                    answer: resultsJson,
                    results: [],
                };
            }

            // Format the results for MCP
            const content = [];

            // Add AI answer if available
            if (results.answer) {
                content.push({
                    type: 'text',
                    text: `**AI Answer:**\n${results.answer}\n\n---\n`,
                });
            }

            // Add search results
            if (results.results && results.results.length > 0) {
                let resultsText = '**Search Results:**\n\n';
                results.results.forEach((result: any, index: number) => {
                    resultsText += `${index + 1}. **${result.title}**\n`;
                    resultsText += `   URL: ${result.url || result.link}\n`;
                    if (result.snippet) {
                        resultsText += `   ${result.snippet}\n`;
                    }
                    resultsText += '\n';
                });
                content.push({
                    type: 'text',
                    text: resultsText,
                });
            }

            // Add metadata
            const metadata = {
                provider: args.provider || 'brave',
                totalResults: results.results?.length || 0,
                timestamp: new Date().toISOString(),
            };

            content.push({
                type: 'text',
                text: `\n---\n*Search completed using ${metadata.provider} provider. Found ${metadata.totalResults} results.*`,
            });

            return { content };
        } else if (request.params.name === 'comprehensive_research') {
            console.error(
                `[MCP] Received comprehensive research request for query: ${args.query}`
            );

            // Perform comprehensive research
            const report = await web_search_task(
                args.query,
                args.modelClass || 'reasoning_mini'
            );

            // Return the comprehensive report
            return {
                content: [
                    {
                        type: 'text',
                        text: report,
                    },
                ],
            };
        } else {
            throw new Error(`Unknown tool: ${request.params.name}`);
        }
    } catch (error: any) {
        console.error(`[MCP] Error:`, error);
        throw error;
    }
});

// Handle resource listing
server.setRequestHandler(ListResourcesRequestSchema, async () => ({
    resources: RESOURCES,
}));

// Handle resource reading
server.setRequestHandler(ReadResourceRequestSchema, async () => {
    throw new Error(`No resources available`);
});

// Start the server
async function runServer() {
    // Create transport with explicit error handling
    const transport = new StdioServerTransport();

    // Add transport error handling
    transport.onerror = error => {
        console.error('[Transport Error]', error);
        // Don't exit on transport errors unless it's a connection close
        if (error?.message?.includes('Connection closed')) {
            console.error('Connection closed by client');
            process.exit(0);
        }
    };

    // Handle graceful shutdown
    process.on('SIGINT', async () => {
        console.error('Received SIGINT, shutting down gracefully...');
        await server.close();
        process.exit(0);
    });

    process.on('SIGTERM', async () => {
        console.error('Received SIGTERM, shutting down gracefully...');
        await server.close();
        process.exit(0);
    });

    // Handle unexpected errors - be more cautious about exiting
    process.on('uncaughtException', error => {
        console.error('Uncaught exception:', error);
        // Try to recover instead of immediately exiting
        if (error && error.message && error.message.includes('EPIPE')) {
            console.error('Pipe error detected, keeping server alive');
            return;
        }
        // Only exit for truly fatal errors
        process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
        console.error('Unhandled rejection at:', promise, 'reason:', reason);
        // Log but don't exit for promise rejections
    });

    // Handle stdin closure
    process.stdin.on('end', () => {
        console.error('Stdin closed, shutting down...');
        // Give a small delay to ensure any final messages are sent
        setTimeout(() => process.exit(0), 100);
    });

    process.stdin.on('error', error => {
        console.error('Stdin error:', error);
        // Don't exit on stdin errors
    });

    try {
        await server.connect(transport);
        console.error('deep-search MCP server running');

        // Keep the process alive
        process.stdin.resume();
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

runServer().catch(error => {
    console.error('Server initialization error:', error);
    process.exit(1);
});
