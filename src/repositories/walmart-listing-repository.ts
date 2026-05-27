import { prisma } from '../database/prisma'
import { WalmartListing } from '../types/listing'
import { mapWalmartListing } from './prisma-mappers'

export class WalmartListingRepository {
  async findAll() {
    const listings = await prisma.walmartListing.findMany({
      orderBy: { createdAt: 'desc' }
    })

    return listings.map(mapWalmartListing)
  }

  async findBySku(sku: string) {
    const listing = await prisma.walmartListing.findFirst({
      where: { sku }
    })

    return listing ? mapWalmartListing(listing) : undefined
  }

  async findBySellerSku(sellerId: string, sku: string) {
    const listing =
      await prisma.walmartListing.findUnique({
        where: { sellerId_sku: { sellerId, sku } }
      })

    return listing ? mapWalmartListing(listing) : undefined
  }

  async findById(id: string) {
    const listing = await prisma.walmartListing.findUnique({
      where: { id }
    })

    return listing ? mapWalmartListing(listing) : undefined
  }

  async save(listing: WalmartListing) {
    const saved = await prisma.walmartListing.upsert({
      where: { id: listing.id },
      create: {
        id: listing.id,
        sellerId: listing.sellerId,
        sku: listing.sku,
        itemId: listing.itemId,
        submissionId: listing.submissionId,
        status: listing.status,
        price: listing.price,
        quantity: listing.quantity,
        upc: listing.upc,
        mpn: listing.mpn,
        brand: listing.brand,
        shippingTemplate: listing.shippingTemplate,
        payload: listing.payload as any,
        webhookUrl: listing.webhookUrl
      },
      update: {
        sellerId: listing.sellerId,
        sku: listing.sku,
        itemId: listing.itemId,
        status: listing.status,
        price: listing.price,
        quantity: listing.quantity,
        upc: listing.upc,
        mpn: listing.mpn,
        brand: listing.brand,
        shippingTemplate: listing.shippingTemplate,
        payload: listing.payload as any,
        webhookUrl: listing.webhookUrl
      }
    })

    return mapWalmartListing(saved)
  }

  async updateStatus(id: string, status: WalmartListing['status']) {
    try {
      const listing = await prisma.walmartListing.update({
        where: { id },
        data: { status }
      })

      return mapWalmartListing(listing)
    } catch {
      return undefined
    }
  }

  async deleteBySku(sku: string) {
    const result = await prisma.walmartListing.deleteMany({
      where: { sku }
    })

    return result.count > 0
  }

  async deleteById(id: string) {
    const result = await prisma.walmartListing.deleteMany({
      where: { id }
    })

    return result.count > 0
  }
}
