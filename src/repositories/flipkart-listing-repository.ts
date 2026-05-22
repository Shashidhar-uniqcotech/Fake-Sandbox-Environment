import { FlipkartListing } from '../types/listing'
import { JsonFileStore } from '../utils/json-file-store'

export class FlipkartListingRepository {
  private readonly store = new JsonFileStore<FlipkartListing[]>(
    'src/db/listings_flipkart.json',
    []
  )

  findAll() {
    return this.store.read()
  }

  findBySku(sku: string) {
    return this.findAll().find(
      listing => listing.sku === sku
    )
  }

  save(listing: FlipkartListing) {
    this.store.update(listings => {
      const withoutCurrent = listings.filter(
        item => item.id !== listing.id
      )

      return [
        ...withoutCurrent,
        listing
      ]
    })

    return listing
  }

  updateStatus(id: string, status: FlipkartListing['status']) {
    let updated: FlipkartListing | undefined

    this.store.update(listings =>
      listings.map(listing => {
        if (listing.id !== id) {
          return listing
        }

        updated = {
          ...listing,
          status,
          updatedAt: new Date().toISOString()
        }

        return updated
      })
    )

    return updated
  }

  deleteBySku(sku: string) {
    const before = this.findAll()

    this.store.write(
      before.filter(
        listing => listing.sku !== sku
      )
    )

    return before.length !== this.findAll().length
  }

  deleteById(id: string) {
    const before = this.findAll()

    this.store.write(
      before.filter(
        listing => listing.id !== id
      )
    )

    return before.some(
      listing => listing.id === id
    )
  }
}
