import { z } from 'zod'

export const inventoryUpdateSchema = z.object({
  quantity: z.number().int().min(0)
})
