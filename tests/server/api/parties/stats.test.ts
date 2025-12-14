// tests/server/api/parties/stats.test.ts
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { join } from 'path'

describe('GET /api/parties/:id/stats', () => {
  it('has a Nitro server route that proxies to backend', () => {
    // Read the route file to verify its structure
    const routePath = join(process.cwd(), 'server/api/parties/[id]/stats.get.ts')
    const routeContent = readFileSync(routePath, 'utf-8')

    // Verify key elements of the route
    expect(routeContent).toContain('defineEventHandler')
    expect(routeContent).toContain('getRouterParam(event, \'id\')')
    expect(routeContent).toContain('config.apiBaseServer')
    expect(routeContent).toContain('/parties/${id}/stats')
    expect(routeContent).toContain('createError')
  })

  it('includes error handling for backend failures', () => {
    const routePath = join(process.cwd(), 'server/api/parties/[id]/stats.get.ts')
    const routeContent = readFileSync(routePath, 'utf-8')

    // Verify error handling is present
    expect(routeContent).toContain('try')
    expect(routeContent).toContain('catch')
    expect(routeContent).toContain('Failed to fetch party stats')
  })
})
