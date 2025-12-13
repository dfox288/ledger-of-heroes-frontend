/**
 * Upload character portrait - Proxies to Laravel backend
 *
 * Accepts multipart/form-data with a 'file' field containing the image.
 * Backend automatically generates thumbnails.
 *
 * Constraints:
 * - Max size: 2MB
 * - Formats: JPEG, PNG, WebP
 *
 * @example POST /api/characters/1/media/portrait
 *          Content-Type: multipart/form-data
 *          file: [binary image data]
 *
 * @see #551 - Character editing UI
 */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const id = getRouterParam(event, 'id')

  try {
    // Read the multipart form data
    const formData = await readMultipartFormData(event)

    if (!formData || formData.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'No file provided'
      })
    }

    // Find the file field
    const fileField = formData.find(f => f.name === 'file')

    if (!fileField || !fileField.data) {
      throw createError({
        statusCode: 400,
        statusMessage: 'No file provided'
      })
    }

    // Validate MIME type before forwarding to backend
    const validTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!fileField.type || !validTypes.includes(fileField.type)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid file type. Please upload a JPEG, PNG, or WebP image.'
      })
    }

    // Create a new FormData to send to backend
    // Convert Buffer to Uint8Array for Blob compatibility
    const backendFormData = new FormData()
    const uint8Array = new Uint8Array(fileField.data)
    const blob = new Blob([uint8Array], { type: fileField.type })
    backendFormData.append('file', blob, fileField.filename || 'portrait')

    // Proxy to backend
    const data = await $fetch(`${config.apiBaseServer}/characters/${id}/media/portrait`, {
      method: 'POST',
      body: backendFormData
    })

    return data
  } catch (error: unknown) {
    const err = error as { statusCode?: number, statusMessage?: string, data?: unknown }

    // Re-throw if it's already a H3 error
    if (err.statusCode) {
      throw createError({
        statusCode: err.statusCode,
        statusMessage: err.statusMessage || 'Failed to upload portrait',
        data: err.data
      })
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to upload portrait'
    })
  }
})
