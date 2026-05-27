import { prisma } from '../database/prisma'
import { EbayListing } from '../types/listing'
import { mapEbayListing } from './prisma-mappers'

export class EbayListingRepository {
  async findAll() {
    const listings = await prisma.ebayListing.findMany({
      orderBy: { createdAt: 'desc' }
    })

    return listings.map(mapEbayListing)
  }

  async findBySku(sku: string) {
    const listing = await prisma.ebayListing.findFirst({
      where: { sku }
    })

    return listing ? mapEbayListing(listing) : undefined
  }

  async findBySellerSku(sellerId: string, sku: string) {
    const listing = await prisma.ebayListing.findUnique({
      where: { sellerId_sku: { sellerId, sku } }
    })

    return listing ? mapEbayListing(listing) : undefined
  }

  async findById(id: string) {
    const listing = await prisma.ebayListing.findUnique({
      where: { id }
    })

    return listing ? mapEbayListing(listing) : undefined
  }

  async save(listing: EbayListing) {
    const saved = await prisma.ebayListing.upsert({
      where: { id: listing.id },
      create: {
        id: listing.id,
        sellerId: listing.sellerId,
        sku: listing.sku,
        itemId: listing.itemId,
        submissionId: listing.submissionId,
        status: listing.status,
        listingType: listing.listingType,
        startPrice: listing.startPrice,
        buyItNowPrice: listing.buyItNowPrice,
        condition: listing.condition,
        quantity: listing.quantity,
        title: listing.title,
        payload: listing.payload as any,
        webhookUrl: listing.webhookUrl
      },
      update: {
        sellerId: listing.sellerId,
        sku: listing.sku,
        itemId: listing.itemId,
        status: listing.status,
        listingType: listing.listingType,
        startPrice: listing.startPrice,
        buyItNowPrice: listing.buyItNowPrice,
        condition: listing.condition,
        quantity: listing.quantity,
        title: listing.title,
        payload: listing.payload as any,
        webhookUrl: listing.webhookUrl
      }
    })

    return mapEbayListing(saved)
  }

  async updateStatus(id: string, status: EbayListing['status']) {
    try {
      const listing = await prisma.ebayListing.update({
        where: { id },
        data: { status }
      })

      return mapEbayListing(listing)
    } catch {
      return undefined
    }
  }

  async deleteBySku(sku: string) {
    const result = await prisma.ebayListing.deleteMany({
      where: { sku }
    })

    return result.count > 0
  }

  async deleteById(id: string) {
    const result = await prisma.ebayListing.deleteMany({
      where: { id }
    })

    return result.count > 0
  }
}
