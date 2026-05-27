import { Hono } from 'hono'

const includesListingUniqueTarget = (target: unknown) =>
  Array.isArray(target)
    ? target.includes('sellerId') && target.includes('sku')
    : typeof target === 'string' &&
      target.includes('sellerId') &&
      target.includes('sku')

const isListingAlreadyExistsError = (error: unknown) => {
  if (
    !error ||
    typeof error !== 'object' ||
    !('code' in error)
  ) {
    return false
  }

  if (error.code === '23505') {
    return true
  }

  if (error.code !== 'P2002') {
    return false
  }

  const meta =
    'meta' in error && error.meta && typeof error.meta === 'object'
      ? error.meta
      : undefined
  const target =
    meta && 'target' in meta ? meta.target : undefined

  return includesListingUniqueTarget(target)
}

export const registerErrorHandler = (app: Hono) => {
  app.onError((error, c) => {
    if (isListingAlreadyExistsError(error)) {
      return c.json(
        { message: 'Listing already exists' },
        409
      )
    }

    console.error('Unhandled request error', error)

    return c.json(
      {
        message: 'Internal Server Error',
        errorId: crypto.randomUUID()
      },
      500
    )
  })
}
