import { prisma } from '../database/prisma'
import { Listing, ListingStatus } from '../types/listing'
import { mapListing } from './prisma-mappers'

export class ListingRepository {
  async findAll() {
    const listings = await prisma.listing.findMany({
      orderBy: { createdAt: 'desc' }
    })

    return listings.map(mapListing)
  }

  async findBySku(sku: string) {
    const listing = await prisma.listing.findFirst({
      where: { sku }
    })

    return listing ? mapListing(listing) : undefined
  }

  async findBySellerSku(sellerId: string, sku: string) {
    const listing = await prisma.listing.findUnique({
      where: { sellerId_sku: { sellerId, sku } }
    })

    return listing ? mapListing(listing) : undefined
  }

  async findById(id: string) {
    const listing = await prisma.listing.findUnique({
      where: { id }
    })

    return listing ? mapListing(listing) : undefined
  }

  async save(listing: Listing) {
    const saved = await prisma.listing.upsert({
      where: { id: listing.id },
      create: {
        id: listing.id,
        sellerId: listing.sellerId,
        sku: listing.sku,
        submissionId: listing.submissionId,
        status: listing.status,
        payload: listing.payload as any,
        webhookUrl: listing.webhookUrl
      },
      update: {
        sellerId: listing.sellerId,
        sku: listing.sku,
        submissionId: listing.submissionId,
        status: listing.status,
        payload: listing.payload as any,
        webhookUrl: listing.webhookUrl
      }
    })

    return mapListing(saved)
  }

  async updateStatus(
    id: string,
    status: ListingStatus
  ) {
    try {
      const listing = await prisma.listing.update({
        where: { id },
        data: { status }
      })

      return mapListing(listing)
    } catch {
      return undefined
    }
  }

  async deleteBySku(sku: string) {
    const result = await prisma.listing.deleteMany({
      where: { sku }
    })

    return result.count > 0
  }

  async deleteById(id: string) {
    const result = await prisma.listing.deleteMany({
      where: { id }
    })

    return result.count > 0
  }
}
