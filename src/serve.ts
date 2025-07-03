#!/usr/bin/env node

// Immediate startup logging to stderr for CI debugging
console.error('[serve.ts] Process started, PID:', process.pid);
console.error('[serve.ts] Node version:', process.version);
console.error('[serve.ts] Current directory:', process.cwd());

// Load environment variables BEFORE importing other modules
import * as dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { logger, LogLevel } from './utils/logger.js';

// Enable debug logging for MCP server
logger.setLevel(LogLevel.DEBUG);
logger.info('MCP Server starting up...');
logger.debug('Node version:', process.version);
logger.debug('Working directory:', process.cwd());
logger.debug('Environment:', { LOG_LEVEL: process.env.LOG_LEVEL });

// Ensure the process doesn't exit on stdio errors
process.stdin.on('error', err => {
    logger.error('stdin error:', err);
});
process.stdout.on('error', err => {
    logger.error('stdout error:', err);
});
process.stderr.on('error', err => {
    logger.error('stderr error:', err);
});

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
                const value = valueParts
                    .join('=')
                    .trim()
                    .replace(/^["']|["']$/g, '');
                if (key && value) {
                    process.env[key.trim()] = value;
                }
            }
        });

        logger.info(`Loaded environment from: ${envPath}`);
    } catch (error) {
        logger.error(`Failed to load ENV_FILE: ${error}`);
        logger.error(
            `Please ensure ENV_FILE points to a valid .env file with your API keys`
        );
    }
} else {
    // Load from standard .env file if present
    dotenv.config();
    logger.info('No ENV_FILE specified, loading from default .env if present');
}

// Check for at least one API key
const hasApiKey = [
    'BRAVE_API_KEY',
    'ANTHROPIC_API_KEY',
    'OPENAI_API_KEY',
    'GOOGLE_API_KEY',
    'OPENROUTER_API_KEY',
    'XAI_API_KEY',
].some(key => process.env[key]);

if (!hasApiKey) {
    logger.warn('No API keys found in environment');
    logger.warn('Please set ENV_FILE to point to your .env file with API keys');
    logger.warn(
        'Example: ENV_FILE=/path/to/.env npx @just-every/mcp-deep-search'
    );
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
logger.debug('About to import @just-every/search...');
import { web_search, web_search_task } from '@just-every/search';
logger.debug('Successfully imported @just-every/search');

logger.debug('Creating MCP server instance...');
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
logger.info('MCP server instance created successfully');

// Add error handling for the server instance
server.onerror = error => {
    logger.error('MCP Server Error:', error);
};

// Tool definitions
const SEARCH_TOOL: Tool = {
    name: 'deep_search',
    description:
        'Perform deep web searches to find current information, research topics, or answer questions using real-time data from multiple search providers. Use this when you need up-to-date information beyond your knowledge cutoff.',
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
    annotations: {
        title: 'Deep Web Search',
        readOnlyHint: true, // Only searches and reads information
        destructiveHint: false,
        idempotentHint: false, // Same query might return different results over time
        openWorldHint: true, // Interacts with external search providers
    },
};

const RESEARCH_TOOL: Tool = {
    name: 'comprehensive_research',
    description:
        'Perform in-depth research on complex topics using AI agents that automatically search multiple sources, analyze findings, and compile comprehensive reports. Ideal for thorough investigations, market research, technical analysis, or any topic requiring deep understanding from multiple perspectives.',
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
    annotations: {
        title: 'Comprehensive Research',
        readOnlyHint: true, // Only researches and reads information
        destructiveHint: false,
        idempotentHint: false, // Research results may vary over time
        openWorldHint: true, // Interacts with external sources and AI models
    },
};

// Resources definitions
const RESOURCES: Resource[] = [];

// Handle tool listing
server.setRequestHandler(ListToolsRequestSchema, async () => {
    logger.debug('Received ListTools request');
    const response = {
        tools: [SEARCH_TOOL, RESEARCH_TOOL],
    };
    logger.debug(
        'Returning tools:',
        response.tools.map(t => t.name)
    );
    return response;
});

// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, async request => {
    logger.info('Received CallTool request:', request.params.name);
    logger.debug('Request params:', JSON.stringify(request.params, null, 2));

    try {
        const args = request.params.arguments as any;

        if (request.params.name === 'deep_search') {
            logger.info(`Processing search request for query: ${args.query}`);
            logger.debug('Search parameters:', {
                query: args.query,
                provider: args.provider,
                maxResults: args.maxResults,
                includeAnswer: args.includeAnswer,
            });

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
            logger.info(
                `Processing comprehensive research request for query: ${args.query}`
            );
            logger.debug('Research parameters:', {
                query: args.query,
                modelClass: args.modelClass,
            });

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
        logger.error('Error processing request:', error.message);
        logger.debug('Error stack:', error.stack);
        logger.debug('Error details:', {
            name: error.name,
            code: error.code,
            ...error,
        });
        throw error;
    }
});

// Handle resource listing
server.setRequestHandler(ListResourcesRequestSchema, async () => {
    logger.debug('Received ListResources request');
    return {
        resources: RESOURCES,
    };
});

// Handle resource reading
server.setRequestHandler(ReadResourceRequestSchema, async request => {
    logger.debug('Received ReadResource request:', request.params);
    throw new Error(`No resources available`);
});

// Start the server
async function runServer() {
    try {
        logger.info('Starting MCP server...');
        logger.debug('Creating StdioServerTransport...');

        const transport = new StdioServerTransport();
        logger.debug('Transport created, connecting to server...');

        // Add transport error handling
        transport.onerror = error => {
            logger.error('Transport Error:', error);
            // Don't exit on transport errors unless it's a connection close
            if (error?.message?.includes('Connection closed')) {
                logger.info('Connection closed by client');
                process.exit(0);
            }
        };

        // Handle graceful shutdown
        const cleanup = async (signal: string) => {
            logger.info(`Received ${signal}, shutting down gracefully...`);
            try {
                await server.close();
                logger.info('Server closed successfully');
                process.exit(0);
            } catch (error) {
                logger.error('Error during cleanup:', error);
                process.exit(1);
            }
        };

        process.on('SIGINT', () => cleanup('SIGINT'));
        process.on('SIGTERM', () => cleanup('SIGTERM'));

        // Handle unexpected errors - be more cautious about exiting
        process.on('uncaughtException', error => {
            logger.error('Uncaught exception:', error.message);
            logger.error('Stack trace:', error.stack);
            logger.debug('Full error object:', error);
            // Try to recover instead of immediately exiting
            if (error && error.message && error.message.includes('EPIPE')) {
                logger.warn('Pipe error detected, keeping server alive');
                return;
            }
            // Only exit for truly fatal errors
            process.exit(1);
        });

        process.on('unhandledRejection', (reason, promise) => {
            logger.error('Unhandled Rejection at:', promise);
            logger.error('Rejection reason:', reason);
            logger.debug('Full rejection details:', { reason, promise });
            // Log but don't exit for promise rejections
        });

        // Log process events
        process.on('exit', code => {
            logger.info(`Process exiting with code: ${code}`);
        });

        process.on('warning', warning => {
            logger.warn('Process warning:', warning.message);
            logger.debug('Warning details:', warning);
        });

        // Handle stdin closure
        process.stdin.on('end', () => {
            logger.info('Stdin closed, shutting down...');
            // Give a small delay to ensure any final messages are sent
            setTimeout(() => process.exit(0), 100);
        });

        process.stdin.on('error', error => {
            logger.warn('Stdin error:', error);
            // Don't exit on stdin errors
        });

        await server.connect(transport);
        logger.info('MCP server connected and running successfully!');
        logger.info('Ready to receive requests');
        logger.debug('Server details:', {
            name: 'deep-search',
            version: '0.1.0',
            pid: process.pid,
        });

        // Log heartbeat every 30 seconds to show server is alive
        setInterval(() => {
            logger.debug('Server heartbeat - still running...');
        }, 30000);

        // Keep the process alive
        process.stdin.resume();
    } catch (error: any) {
        logger.error('Failed to start server:', error.message);
        logger.debug('Startup error details:', error);
        throw error;
    }
}

// Start the server
logger.info('Initializing MCP server...');
runServer().catch(error => {
    logger.error('Fatal server error:', error.message);
    logger.error('Stack trace:', error.stack);
    logger.debug('Full error:', error);
    process.exit(1);
});
