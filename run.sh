#!/bin/bash
# Run npm commands in the Docker container for this agent worktree
docker compose -f docker-compose.yml -f docker-compose.override.yml exec nuxt npm "$@"
