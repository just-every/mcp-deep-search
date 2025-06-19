#!/bin/bash

# Debug wrapper for MCP server
LOG_FILE="/tmp/mcp-deep-search-debug.log"

echo "[$(date)] Debug wrapper started" >> "$LOG_FILE"
echo "Working directory: $(pwd)" >> "$LOG_FILE"
echo "Arguments: $@" >> "$LOG_FILE"
echo "Environment:" >> "$LOG_FILE"
env | grep -E "(ENV_FILE|PATH|NODE)" >> "$LOG_FILE"

# Change to the correct directory
cd /Users/zemaj/www/just-every/mcp-deep-search

echo "[$(date)] Changed to directory: $(pwd)" >> "$LOG_FILE"
echo "[$(date)] Starting node server..." >> "$LOG_FILE"

# Run the actual server and capture all output
# Use exec to replace the shell process and maintain stdin/stdout properly
exec node bin/mcp-deep-search.js 2>> "$LOG_FILE"