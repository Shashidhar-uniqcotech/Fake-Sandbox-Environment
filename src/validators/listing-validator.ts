import { z } from 'zod'

export const listingSchema = z.object({
  productType: z.string(),
  title: z.string().optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  brand: z.string().optional(),
  price: z.number().nonnegative().optional(),
  currency: z.string().optional(),
  quantity: z.number().int().nonnegative().optional(),

  attributes: z.object({
    brand: z.array(
      z.object({
        value: z.string()
      })
    ),

    item_name: z.array(
      z.object({
        value: z.string()
      })
    )
  }),

  webhookUrl: z.string().url().optional()
})

export const flipkartListingSchema = listingSchema.extend({
  channelSkuId: z.string().optional(),
  productId: z.string().optional(),
  price: z.number().nonnegative().optional(),
  quantity: z.number().int().nonnegative().optional(),
  hsn: z.string().optional(),
  gstRate: z.number().nonnegative().optional(),
  fulfillment: z.string().optional()
})

export const walmartListingSchema = listingSchema.extend({
  itemId: z.string().optional(),
  price: z.number().nonnegative().optional(),
  quantity: z.number().int().nonnegative().optional(),
  upc: z.string().optional(),
  mpn: z.string().optional(),
  brand: z.string().optional(),
  shippingTemplate: z.string().optional()
})

export const ebayListingSchema = listingSchema.extend({
  itemId: z.string().optional(),
  listingType: z.string().optional(),
  startPrice: z.number().nonnegative().optional(),
  buyItNowPrice: z.number().nonnegative().optional(),
  condition: z.string().optional(),
  quantity: z.number().int().nonnegative().optional(),
  title: z.string().optional()
})

export const googleShoppingListingSchema =
  listingSchema.extend({
    offerId: z.string().optional(),
    googleProductCategory: z.string().optional(),
    targetCountry: z.string().optional(),
    contentLanguage: z.string().optional(),
    condition: z.string().optional(),
    availability: z.string().optional()
  })

export const metaMarketplaceListingSchema =
  listingSchema.extend({
    facebookCategoryId: z.string().optional(),
    listingType: z.string().optional(),
    condition: z.string().optional(),
    location: z.string().optional(),
    availability: z.string().optional()
  })

export const shopifyListingSchema =
  listingSchema.extend({
    handle: z.string().optional(),
    vendor: z.string().optional(),
    productType: z.string(),
    tags: z.string().optional(),
    optionName: z.string().optional(),
    optionValue: z.string().optional()
  })

export const etsyListingSchema =
  listingSchema.extend({
    taxonomyId: z.string().optional(),
    whoMade: z.string().optional(),
    whenMade: z.string().optional(),
    isSupply: z.boolean().optional(),
    shippingProfileId: z.string().optional()
  })
