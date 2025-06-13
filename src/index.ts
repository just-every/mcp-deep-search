#!/usr/bin/env node

// Load environment variables BEFORE importing other modules
import * as dotenv from 'dotenv';
dotenv.config();

import { Command } from 'commander';
import { web_search, web_search_task } from '@just-every/search';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read package.json for version
const packageJson = JSON.parse(
    readFileSync(join(__dirname, '../package.json'), 'utf-8')
);

const program = new Command();

program
    .name('mcp-deep-search')
    .description('MCP server for deep web search using @just-every/search')
    .version(packageJson.version);

program
    .command('search <query>')
    .description('Perform a web search')
    .option(
        '-p, --provider <provider>',
        'Search provider (brave, anthropic, openai, google, etc.)',
        'brave'
    )
    .option('-n, --max-results <number>', 'Maximum number of results', '10')
    .option('-a, --include-answer', 'Include AI-generated answer if available')
    .option('-o, --output <path>', 'Output results to file (JSON format)')
    .action(async (query: string, options) => {
        try {
            console.error(`🔍 Searching for: "${query}"`);
            console.error(`📍 Provider: ${options.provider}`);

            const resultsJson = await web_search(
                options.provider || 'brave',
                query,
                parseInt(options.maxResults, 10)
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

            // Format output
            const output = {
                query,
                provider: options.provider,
                timestamp: new Date().toISOString(),
                answer: results.answer,
                results: results.results,
            };

            if (options.output) {
                // Save to file
                writeFileSync(options.output, JSON.stringify(output, null, 2));
                console.error(`✅ Results saved to: ${options.output}`);
            } else {
                // Output to console
                if (results.answer) {
                    console.log('\n📝 AI Answer:');
                    console.log(results.answer);
                    console.log('\n---\n');
                }

                if (results.results && results.results.length > 0) {
                    console.log('🔍 Search Results:\n');
                    results.results.forEach((result: any, index: number) => {
                        console.log(`${index + 1}. ${result.title}`);
                        console.log(`   URL: ${result.url || result.link}`);
                        if (result.snippet) {
                            console.log(`   ${result.snippet}`);
                        }
                        console.log();
                    });
                }

                console.error(
                    `\n✅ Found ${results.results?.length || 0} results`
                );
            }
        } catch (error) {
            console.error(
                '❌ Error:',
                error instanceof Error ? error.message : error
            );
            process.exit(1);
        }
    });

program
    .command('research <query>')
    .description(
        'Perform comprehensive research using multiple search engines automatically'
    )
    .option(
        '-m, --model-class <class>',
        'AI model class to use',
        'reasoning_mini'
    )
    .option('-o, --output <path>', 'Output report to file')
    .action(async (query: string, options) => {
        try {
            console.error(`🔬 Starting comprehensive research on: "${query}"`);
            console.error(`🤖 Using model class: ${options.modelClass}\n`);

            const report = await web_search_task(query, options.modelClass);

            if (options.output) {
                // Save to file
                writeFileSync(options.output, report);
                console.error(
                    `\n✅ Research report saved to: ${options.output}`
                );
            } else {
                // Output to console
                console.log(report);
            }
        } catch (error) {
            console.error(
                '❌ Error:',
                error instanceof Error ? error.message : error
            );
            process.exit(1);
        }
    });

program
    .command('serve')
    .description('Run as an MCP server')
    .action(async () => {
        // Import and run the serve module
        await import('./serve.js');
    });

program.parse();
