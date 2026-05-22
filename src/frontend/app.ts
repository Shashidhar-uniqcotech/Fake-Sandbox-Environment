type AnalyticsResponse = {
  listings: {
    total: number
    byStatus: Record<string, number>
    byPlatform?: Record<MarketplacePlatform, number>
  }
  inventory?: {
    total: number
    byPlatform: Record<MarketplacePlatform, number>
  }
  webhooks: {
    totalDeliveries: number
    byPlatform?: Record<MarketplacePlatform, number>
  }
}

type MarketplacePlatform =
  | 'flipkart'
  | 'walmart'
  | 'ebay'

type Listing = {
  id: string
  platform: 'amazon' | 'flipkart' | 'walmart' | 'ebay'
  sellerId: string
  sku: string
  status: string
  createdAt: string
}

type EmulatorEvent = {
  event: string
  resourceType: string
  resourceId: string
  createdAt: string
}

type QueueMetrics = {
  driver: string
  waiting: number
  delayed: number
  active: number
  completed: number
  failed: number
  deadLettered: number
}

type WebhookDelivery = {
  platform: MarketplacePlatform | 'legacy'
  event: string
  status: string
  attempts: number
  url: string
  updatedAt: string
}

type InventoryItem = {
  platform: MarketplacePlatform
  sku: string
  quantity: number
  updatedAt: string
}

type ApiOptions = RequestInit & {
  headers?: Record<string, string>
}

const mustFind = <T extends Element>(
  selector: string
) => {
  const element = document.querySelector<T>(selector)

  if (!element) {
    throw new Error(
      `Missing frontend element: ${selector}`
    )
  }

  return element
}

const state: {
  token: string
  refreshTimer?: number
  toastTimer?: number
} = {
  token:
    localStorage.getItem('amazonEmulatorToken') ||
    'fake-token'
}

const els = {
  tokenInput:
    mustFind<HTMLInputElement>('#tokenInput'),
  saveTokenButton:
    mustFind<HTMLButtonElement>('#saveTokenButton'),
  refreshButton:
    mustFind<HTMLButtonElement>('#refreshButton'),
  statusPill:
    mustFind<HTMLElement>('#statusPill'),
  toast:
    mustFind<HTMLElement>('#toast'),
  navButtons:
    document.querySelectorAll<HTMLButtonElement>(
      '.nav-button'
    ),
  panels:
    document.querySelectorAll<HTMLElement>(
      '.tab-panel'
    ),
  metricTotalListings:
    mustFind<HTMLElement>('#metricTotalListings'),
  metricDiscoverable:
    mustFind<HTMLElement>('#metricDiscoverable'),
  metricInventoryItems:
    mustFind<HTMLElement>('#metricInventoryItems'),
  metricWebhookDeliveries:
    mustFind<HTMLElement>('#metricWebhookDeliveries'),
  platformSummary:
    mustFind<HTMLElement>('#platformSummary'),
  queueDriver:
    mustFind<HTMLElement>('#queueDriver'),
  queueMetrics:
    mustFind<HTMLElement>('#queueMetrics'),
  recentEvents:
    mustFind<HTMLElement>('#recentEvents'),
  listingsTable:
    mustFind<HTMLTableSectionElement>('#listingsTable'),
  listingForm:
    mustFind<HTMLFormElement>('#listingForm'),
  platformSelect:
    mustFind<HTMLSelectElement>('#platformSelect'),
  platformFields:
    document.querySelectorAll<HTMLElement>(
      '[data-platform-fields]'
    ),
  reloadListingsButton:
    mustFind<HTMLButtonElement>('#reloadListingsButton'),
  inventoryForm:
    mustFind<HTMLFormElement>('#inventoryForm'),
  inventoryPlatform:
    mustFind<HTMLSelectElement>('#inventoryPlatform'),
  inventoryLookupPlatform:
    mustFind<HTMLSelectElement>('#inventoryLookupPlatform'),
  inventoryLookupSku:
    mustFind<HTMLInputElement>('#inventoryLookupSku'),
  inventoryLookupButton:
    mustFind<HTMLButtonElement>('#inventoryLookupButton'),
  inventoryResult:
    mustFind<HTMLPreElement>('#inventoryResult'),
  eventLog:
    mustFind<HTMLElement>('#eventLog'),
  webhooksTable:
    mustFind<HTMLTableSectionElement>('#webhooksTable')
}

els.tokenInput.value = state.token

const api = async <T>(
  path: string,
  options: ApiOptions = {}
): Promise<T> => {
  const headers = {
    Authorization: `Bearer ${state.token}`,
    ...(options.headers || {})
  }

  const response = await fetch(path, {
    ...options,
    headers
  })

  const text = await response.text()
  const contentType = response.headers.get('content-type') || ''
  const data =
    text && contentType.includes('application/json')
      ? JSON.parse(text)
      : text

  if (!response.ok) {
    throw new Error(
      typeof data === 'object' && data && 'message' in data
        ? String(data.message)
        : text || `HTTP ${response.status}`
    )
  }

  return data as T
}

const setStatus = (text: string) => {
  els.statusPill.textContent = text
}

const toast = (message: string) => {
  els.toast.textContent = message
  els.toast.classList.add('is-visible')

  window.clearTimeout(state.toastTimer)
  state.toastTimer = window.setTimeout(() => {
    els.toast.classList.remove('is-visible')
  }, 2600)
}

const formatDate = (value?: string) => {
  if (!value) {
    return '-'
  }

  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(value))
}

const statusClass = (value: string) =>
  value.toLowerCase()

const listingApiBase = (platform: Listing['platform']) =>
  platform === 'amazon' ? '/listings' : `/${platform}/listings`

const createListingApiPath = (
  platform: string,
  sellerId: string,
  sku: string
) => {
  const encodedSellerId = encodeURIComponent(sellerId)
  const encodedSku = encodeURIComponent(sku)

  if (platform === 'amazon') {
    return `/listings/2021-08-01/items/${encodedSellerId}/${encodedSku}`
  }

  if (marketplacePlatforms.includes(platform as MarketplacePlatform)) {
    return `/${platform}/items/${encodedSellerId}/${encodedSku}`
  }

  return `/flipkart/items/${encodedSellerId}/${encodedSku}`
}

const normalizeListing = (listing: Listing): Listing => ({
  ...listing,
  platform: listing.platform || 'amazon'
})

const marketplacePlatforms: MarketplacePlatform[] = [
  'flipkart',
  'walmart',
  'ebay'
]

const renderPlatformSummary = (
  analytics: AnalyticsResponse
) => {
  els.platformSummary.innerHTML = marketplacePlatforms
    .map(platform => `
      <div class="queue-item">
        <span>${platform}</span>
        <strong>${analytics.listings.byPlatform?.[platform] || 0}</strong>
        <small>${analytics.inventory?.byPlatform[platform] || 0} stock / ${analytics.webhooks.byPlatform?.[platform] || 0} hooks</small>
      </div>
    `)
    .join('')
}

const renderQueueMetrics = (
  metrics: QueueMetrics
) => {
  els.queueDriver.textContent = metrics.driver

  const items: Array<[string, number]> = [
    ['Waiting', metrics.waiting],
    ['Delayed', metrics.delayed],
    ['Active', metrics.active],
    ['Completed', metrics.completed],
    ['Failed', metrics.failed],
    ['Dead lettered', metrics.deadLettered]
  ]

  els.queueMetrics.innerHTML = items
    .map(([label, value]) => `
      <div class="queue-item">
        <span>${label}</span>
        <strong>${value}</strong>
      </div>
    `)
    .join('')
}

const renderEvents = (
  target: HTMLElement,
  events: EmulatorEvent[],
  limit?: number
) => {
  const visibleEvents =
    typeof limit === 'number'
      ? events.slice(0, limit)
      : events

  target.innerHTML = visibleEvents.length
    ? visibleEvents
        .map(event => `
        <article class="event-item">
          <strong>${event.event}</strong>
          <span>${event.resourceType} / ${event.resourceId}</span>
          <span>${formatDate(event.createdAt)}</span>
        </article>
      `)
        .join('')
    : '<article class="event-item"><strong>No events yet</strong><span>Submit a listing or update inventory.</span></article>'
}

const renderListings = (listings: Listing[]) => {
  const normalizedListings = listings.map(normalizeListing)

  els.listingsTable.innerHTML = normalizedListings.length
    ? normalizedListings
        .map(listing => `
        <tr>
          <td>${listing.platform}</td>
          <td>${listing.sku}</td>
          <td>${listing.sellerId}</td>
          <td><span class="status-tag ${statusClass(listing.status)}">${listing.status}</span></td>
          <td>${formatDate(listing.createdAt)}</td>
          <td>
            <button class="delete-button" data-delete-id="${listing.id}" data-platform="${listing.platform}">Delete</button>
          </td>
        </tr>
      `)
        .join('')
    : '<tr><td colspan="6">No listings found.</td></tr>'
}

const renderWebhooks = (
  deliveries: WebhookDelivery[]
) => {
  els.webhooksTable.innerHTML = deliveries.length
    ? deliveries
        .map(delivery => `
        <tr>
          <td>${delivery.event}</td>
          <td>${delivery.platform}</td>
          <td><span class="status-tag ${statusClass(delivery.status)}">${delivery.status}</span></td>
          <td>${delivery.attempts}</td>
          <td>${delivery.url}</td>
          <td>${formatDate(delivery.updatedAt)}</td>
        </tr>
      `)
        .join('')
    : '<tr><td colspan="6">No webhook deliveries yet.</td></tr>'
}

const refresh = async () => {
  try {
    setStatus('Loading')

    const [
      analytics,
      listings,
      events,
      webhooks,
      queueMetrics
    ] = await Promise.all([
      api<AnalyticsResponse>('/dashboard/analytics'),
      api<Listing[]>('/dashboard/processing-status'),
      api<EmulatorEvent[]>('/dashboard/events'),
      api<WebhookDelivery[]>('/dashboard/webhooks'),
      api<QueueMetrics>('/dashboard/queue-metrics')
    ])

    els.metricTotalListings.textContent =
      String(analytics.listings.total)
    els.metricDiscoverable.textContent =
      String(
        analytics.listings.byStatus.DISCOVERABLE || 0
      )
    els.metricInventoryItems.textContent =
      String(analytics.inventory?.total || 0)
    els.metricWebhookDeliveries.textContent =
      String(analytics.webhooks.totalDeliveries)

    renderQueueMetrics(queueMetrics)
    renderPlatformSummary(analytics)
    renderEvents(els.recentEvents, events, 5)
    renderEvents(els.eventLog, events)
    renderListings(listings)
    renderWebhooks(webhooks)

    setStatus('Ready')
  } catch (error) {
    setStatus('Error')
    toast(
      error instanceof Error
        ? error.message
        : 'Unknown dashboard error'
    )
  }
}

const switchTab = (tabId: string) => {
  els.navButtons.forEach(button => {
    button.classList.toggle(
      'is-active',
      button.dataset.tab === tabId
    )
  })

  els.panels.forEach(panel => {
    panel.classList.toggle(
      'is-active',
      panel.id === tabId
    )
  })
}

const syncPlatformFields = () => {
  els.platformFields.forEach(section => {
    section.hidden =
      section.dataset.platformFields !==
      els.platformSelect.value
  })
}

els.navButtons.forEach(button => {
  button.addEventListener('click', () => {
    if (button.dataset.tab) {
      switchTab(button.dataset.tab)
    }
  })
})

els.saveTokenButton.addEventListener('click', () => {
  state.token =
    els.tokenInput.value.trim() || 'fake-token'
  localStorage.setItem(
    'amazonEmulatorToken',
    state.token
  )
  toast('Token saved')
  void refresh()
})

els.refreshButton.addEventListener(
  'click',
  () => void refresh()
)
els.reloadListingsButton.addEventListener(
  'click',
  () => void refresh()
)
els.platformSelect.addEventListener(
  'change',
  syncPlatformFields
)

els.listingForm.addEventListener(
  'submit',
  event => {
    event.preventDefault()

    void (async () => {
      const form = new FormData(
        els.listingForm
      )
      const webhookUrl = String(
        form.get('webhookUrl') || ''
      ).trim()
      const platform = String(
        form.get('platform') ||
          els.platformSelect.value ||
          'flipkart'
      )
      const sellerId = String(form.get('sellerId'))
      const sku = String(form.get('sku'))
      const price = Number(form.get('price'))
      const quantity = Number(form.get('quantity'))

      const payload = {
        productType: String(form.get('productType')),
        title: String(form.get('itemName')),
        brand: String(form.get('brand')),
        ...(Number.isFinite(price) ? { price } : {}),
        ...(Number.isInteger(quantity) ? { quantity } : {}),
        attributes: {
          brand: [
            { value: String(form.get('brand')) }
          ],
          item_name: [
            { value: String(form.get('itemName')) }
          ]
        },
        ...(platform === 'flipkart'
          ? {
              channelSkuId: String(
                form.get('channelSkuId') || ''
              ),
              hsn: String(form.get('hsn') || ''),
              gstRate: Number(form.get('gstRate')),
              fulfillment: String(
                form.get('fulfillment') || ''
              )
            }
          : {}),
        ...(platform === 'walmart'
          ? {
              upc: String(form.get('upc') || ''),
              mpn: String(form.get('mpn') || ''),
              shippingTemplate: String(
                form.get('shippingTemplate') || ''
              )
            }
          : {}),
        ...(platform === 'ebay'
          ? {
              listingType: String(
                form.get('listingType') || ''
              ),
              condition: String(
                form.get('condition') || ''
              ),
              startPrice: price,
              buyItNowPrice: Number(
                form.get('buyItNowPrice')
              )
            }
          : {}),
        ...(webhookUrl ? { webhookUrl } : {})
      }

      try {
        await api(
          createListingApiPath(platform, sellerId, sku),
          {
            method: 'PUT',
            headers: {
              'content-type': 'application/json'
            },
            body: JSON.stringify(payload)
          }
        )

        toast('Listing submitted')
        await refresh()
      } catch (error) {
        toast(
          error instanceof Error
            ? error.message
            : 'Failed to submit listing'
        )
      }
    })()
  }
)

els.listingsTable.addEventListener(
  'click',
  event => {
    const target = event.target

    if (!(target instanceof Element)) {
      return
    }

    const button = target.closest<HTMLButtonElement>(
      '[data-delete-id]'
    )

    if (!button?.dataset.deleteId) {
      return
    }

    void (async () => {
      try {
        await api(
          `${listingApiBase(button.dataset.platform as Listing['platform'])}/id/${button.dataset.deleteId}`,
          { method: 'DELETE' }
        )
        toast('Listing deleted')
        await refresh()
      } catch (error) {
        toast(
          error instanceof Error
            ? error.message
            : 'Failed to delete listing'
        )
      }
    })()
  }
)

els.inventoryForm.addEventListener(
  'submit',
  event => {
    event.preventDefault()

    void (async () => {
      const form = new FormData(
        els.inventoryForm
      )
      const platform = String(
        form.get('platform')
      ) as MarketplacePlatform
      const sku = String(form.get('sku'))
      const quantity = Number(form.get('quantity'))

      try {
        const item = await api<InventoryItem>(
          `/inventory/${platform}/${sku}`,
          {
            method: 'PATCH',
            headers: {
              'content-type': 'application/json'
            },
            body: JSON.stringify({ quantity })
          }
        )

        els.inventoryResult.textContent =
          JSON.stringify(item, null, 2)
        toast('Inventory updated')
        await refresh()
      } catch (error) {
        toast(
          error instanceof Error
            ? error.message
            : 'Failed to update inventory'
        )
      }
    })()
  }
)

els.inventoryLookupButton.addEventListener(
  'click',
  () => {
    void (async () => {
      try {
        const item = await api<InventoryItem>(
          `/inventory/${els.inventoryLookupPlatform.value}/${els.inventoryLookupSku.value.trim()}`
        )
        els.inventoryResult.textContent =
          JSON.stringify(item, null, 2)
      } catch (error) {
        els.inventoryResult.textContent =
          JSON.stringify(
            {
              message:
                error instanceof Error
                  ? error.message
                  : 'Inventory lookup failed'
            },
            null,
            2
          )
      }
    })()
  }
)

void refresh()
syncPlatformFields()
state.refreshTimer = window.setInterval(
  refresh,
  30000
)
