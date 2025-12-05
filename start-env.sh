#!/bin/bash
# Start the Docker environment for this agent worktree
docker compose -f docker-compose.yml -f docker-compose.override.yml up -d
echo ""
echo "Environment started! Access at:"
grep -E "^\s+- \"[0-9]+:" docker-compose.override.yml | sed 's/.*"\([0-9]*\):.*/  http:\/\/localhost:\1/'
