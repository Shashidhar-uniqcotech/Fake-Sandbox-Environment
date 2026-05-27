import { prisma } from '../database/prisma'
import { FlipkartListing } from '../types/listing'
import { mapFlipkartListing } from './prisma-mappers'

export class FlipkartListingRepository {
  async findAll() {
    const listings = await prisma.flipkartListing.findMany({
      orderBy: { createdAt: 'desc' }
    })

    return listings.map(mapFlipkartListing)
  }

  async findBySku(sku: string) {
    const listing = await prisma.flipkartListing.findFirst({
      where: { sku }
    })

    return listing ? mapFlipkartListing(listing) : undefined
  }

  async findBySellerSku(sellerId: string, sku: string) {
    const listing =
      await prisma.flipkartListing.findUnique({
        where: { sellerId_sku: { sellerId, sku } }
      })

    return listing ? mapFlipkartListing(listing) : undefined
  }

  async findById(id: string) {
    const listing = await prisma.flipkartListing.findUnique({
      where: { id }
    })

    return listing ? mapFlipkartListing(listing) : undefined
  }

  async save(listing: FlipkartListing) {
    const saved = await prisma.flipkartListing.upsert({
      where: { id: listing.id },
      create: {
        id: listing.id,
        sellerId: listing.sellerId,
        sku: listing.sku,
        channelSkuId: listing.channelSkuId,
        productId: listing.productId,
        submissionId: listing.submissionId,
        status: listing.status,
        price: listing.price,
        quantity: listing.quantity,
        hsn: listing.hsn,
        gstRate: listing.gstRate,
        fulfillment: listing.fulfillment,
        payload: listing.payload as any,
        webhookUrl: listing.webhookUrl
      },
      update: {
        sellerId: listing.sellerId,
        sku: listing.sku,
        channelSkuId: listing.channelSkuId,
        productId: listing.productId,
        status: listing.status,
        price: listing.price,
        quantity: listing.quantity,
        hsn: listing.hsn,
        gstRate: listing.gstRate,
        fulfillment: listing.fulfillment,
        payload: listing.payload as any,
        webhookUrl: listing.webhookUrl
      }
    })

    return mapFlipkartListing(saved)
  }

  async updateStatus(id: string, status: FlipkartListing['status']) {
    try {
      const listing = await prisma.flipkartListing.update({
        where: { id },
        data: { status }
      })

      return mapFlipkartListing(listing)
    } catch {
      return undefined
    }
  }

  async deleteBySku(sku: string) {
    const result = await prisma.flipkartListing.deleteMany({
      where: { sku }
    })

    return result.count > 0
  }

  async deleteById(id: string) {
    const result = await prisma.flipkartListing.deleteMany({
      where: { id }
    })

    return result.count > 0
  }
}
