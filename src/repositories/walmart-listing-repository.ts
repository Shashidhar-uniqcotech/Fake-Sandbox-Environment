import { WalmartListing } from '../types/listing'
import { JsonFileStore } from '../utils/json-file-store'

export class WalmartListingRepository {
  private readonly store = new JsonFileStore<WalmartListing[]>(
    'src/db/listings_walmart.json',
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

  save(listing: WalmartListing) {
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

  updateStatus(id: string, status: WalmartListing['status']) {
    let updated: WalmartListing | undefined

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
