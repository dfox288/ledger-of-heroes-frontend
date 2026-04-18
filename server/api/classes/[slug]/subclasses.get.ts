// server/api/classes/[slug]/subclasses.get.ts

interface ClassSubclass {
  id: number
  name: string
  slug: string
  description?: string
  source?: { code: string, name: string }
}

interface ClassResponse {
  data: {
    subclasses?: ClassSubclass[]
  }
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const slug = getRouterParam(event, 'slug')

  if (!slug) {
    throw createError({ statusCode: 400, statusMessage: 'Class slug required' })
  }

  try {
    // Fetch the full class data from backend (which includes subclasses)
    const classData = await $fetch<ClassResponse>(`${config.apiBaseServer}/classes/${slug}`)

    // Return just the subclasses array wrapped in data object
    return {
      data: classData.data?.subclasses || []
    }
  } catch (error: unknown) {
    const err = error as { statusCode?: number, statusMessage?: string, data?: unknown }
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.statusMessage || 'Failed to fetch subclasses',
      data: err.data
    })
  }
})
