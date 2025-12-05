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

  // Fetch the full class data from backend (which includes subclasses)
  const classData = await $fetch<ClassResponse>(`${config.apiBaseServer}/classes/${slug}`)

  // Return just the subclasses array wrapped in data object
  return {
    data: classData.data?.subclasses || []
  }
})
