import { prisma } from '../database/prisma'
import {
  GenericMarketplaceListing,
  ListingStatus
} from '../types/listing'
import { mapGenericMarketplaceListing } from './prisma-mappers'

export class GenericMarketplaceListingRepository {
  async findAll() {
    const listings =
      await prisma.genericMarketplaceListing.findMany({
        orderBy: { createdAt: 'desc' }
      })

    return listings.map(mapGenericMarketplaceListing)
  }

  async findBySku(sku: string) {
    const listing =
      await prisma.genericMarketplaceListing.findFirst({
        where: { sku }
      })

    return listing
      ? mapGenericMarketplaceListing(listing)
      : undefined
  }

  async findByPlatformSellerSku(
    platform: GenericMarketplaceListing['platform'],
    sellerId: string,
    sku: string
  ) {
    const listing =
      await prisma.genericMarketplaceListing.findUnique({
        where: {
          platform_sellerId_sku: {
            platform,
            sellerId,
            sku
          }
        }
      })

    return listing
      ? mapGenericMarketplaceListing(listing)
      : undefined
  }

  async findById(id: string) {
    const listing =
      await prisma.genericMarketplaceListing.findUnique({
        where: { id }
      })

    return listing
      ? mapGenericMarketplaceListing(listing)
      : undefined
  }

  async save(listing: GenericMarketplaceListing) {
    const saved =
      await prisma.genericMarketplaceListing.upsert({
        where: { id: listing.id },
        create: {
          id: listing.id,
          platform: listing.platform,
          sellerId: listing.sellerId,
          sku: listing.sku,
          submissionId: listing.submissionId,
          status: listing.status,
          price: listing.price,
          quantity: listing.quantity,
          title: listing.title,
          brand: listing.brand,
          payload: listing.payload as any,
          webhookUrl: listing.webhookUrl,
          platformFields: listing.platformFields as any
        },
        update: {
          platform: listing.platform,
          sellerId: listing.sellerId,
          sku: listing.sku,
          status: listing.status,
          price: listing.price,
          quantity: listing.quantity,
          title: listing.title,
          brand: listing.brand,
          payload: listing.payload as any,
          webhookUrl: listing.webhookUrl,
          platformFields: listing.platformFields as any
        }
      })

    return mapGenericMarketplaceListing(saved)
  }

  async updateStatus(id: string, status: ListingStatus) {
    try {
      const listing =
        await prisma.genericMarketplaceListing.update({
          where: { id },
          data: { status }
        })

      return mapGenericMarketplaceListing(listing)
    } catch {
      return undefined
    }
  }

  async deleteBySku(sku: string) {
    const result =
      await prisma.genericMarketplaceListing.deleteMany({
        where: { sku }
      })

    return result.count > 0
  }

  async deleteById(id: string) {
    const result =
      await prisma.genericMarketplaceListing.deleteMany({
        where: { id }
      })

    return result.count > 0
  }
}
