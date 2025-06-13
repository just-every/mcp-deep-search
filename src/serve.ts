#!/usr/bin/env node

// Load environment variables BEFORE importing other modules
import * as dotenv from 'dotenv';
dotenv.config();

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
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error('deep-search MCP server running');

    // Handle graceful shutdown
    const cleanup = async () => {
        process.exit(0);
    };

    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);
}

runServer().catch(error => {
    console.error('Server error:', error);
    process.exit(1);
});
