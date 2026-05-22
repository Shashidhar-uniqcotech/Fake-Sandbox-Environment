export type WebhookDeliveryStatus =
  | 'PENDING'
  | 'DELIVERED'
  | 'FAILED'

export type WebhookDelivery = {
  id: string
  url: string
  event: string
  payload: Record<string, unknown>
  status: WebhookDeliveryStatus
  attempts: number
  lastStatusCode?: number
  lastError?: string
  createdAt: string
  updatedAt: string
}
