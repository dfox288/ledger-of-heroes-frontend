/**
 * Class API Handlers
 *
 * MSW handlers for class-related endpoints.
 */

import { http, HttpResponse } from 'msw'
import { baseClasses, getClassBySlug } from '../fixtures/classes'

const API_BASE = '/api'

export const classHandlers = [
  // GET /api/classes - List all base classes
  http.get(`${API_BASE}/classes`, ({ request }) => {
    const url = new URL(request.url)
    const filter = url.searchParams.get('filter')

    let classes = baseClasses

    // Handle filter for base classes only
    if (filter?.includes('is_base_class=true')) {
      classes = classes.filter(c => c.is_base_class)
    }

    return HttpResponse.json({
      data: classes,
      meta: {
        current_page: 1,
        last_page: 1,
        per_page: 50,
        total: classes.length
      }
    })
  }),

  // GET /api/classes/:slug - Get single class
  http.get(`${API_BASE}/classes/:slug`, ({ params }) => {
    const { slug } = params
    const classData = getClassBySlug(slug as string)

    if (classData) {
      return HttpResponse.json({ data: classData })
    }

    return HttpResponse.json({ error: 'Class not found' }, { status: 404 })
  }),

  // POST /api/characters/:id/classes/:classSlug/level-up - Level up in specific class
  http.post(`${API_BASE}/characters/:id/classes/:classSlug/level-up`, ({ params }) => {
    const { classSlug } = params
    const classData = getClassBySlug(classSlug as string)

    if (!classData) {
      return HttpResponse.json({ error: 'Class not found' }, { status: 404 })
    }

    // Return a successful level-up result
    return HttpResponse.json({
      data: {
        previous_level: 1,
        new_level: 2,
        class_slug: classSlug,
        class_name: classData.name,
        hit_die: `d${classData.hit_die}`,
        features_gained: [],
        hp_choice_pending: true,
        asi_pending: false,
        spell_slots: null
      }
    })
  })
]
