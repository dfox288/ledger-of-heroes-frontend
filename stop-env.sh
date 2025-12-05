#!/bin/bash
# Stop the Docker environment for this agent worktree
docker compose -f docker-compose.yml -f docker-compose.override.yml down
echo "Environment stopped."
