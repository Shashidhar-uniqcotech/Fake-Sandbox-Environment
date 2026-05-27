import { z } from 'zod'

const requiredString = z.string().trim().min(1)
const requiredNumber = z.number().nonnegative()
const requiredInteger = z.number().int().nonnegative()

export const listingSchema = z.object({
  productType: requiredString,
  title: requiredString,
  description: z.string().optional(),
  category: z.string().optional(),
  brand: requiredString,
  price: requiredNumber,
  currency: z.string().optional(),
  quantity: requiredInteger,

  attributes: z.object({
    brand: z.array(
      z.object({
        value: requiredString
      })
    ).min(1),

    item_name: z.array(
      z.object({
        value: requiredString
      })
    ).min(1)
  }),

  webhookUrl: z.string().url().optional()
})

export const flipkartListingSchema = listingSchema.extend({
  channelSkuId: requiredString,
  productId: z.string().optional(),
  price: requiredNumber,
  quantity: requiredInteger,
  hsn: requiredString,
  gstRate: requiredNumber,
  fulfillment: requiredString
})

export const walmartListingSchema = listingSchema.extend({
  itemId: z.string().optional(),
  price: requiredNumber,
  quantity: requiredInteger,
  upc: requiredString,
  mpn: requiredString,
  brand: requiredString,
  shippingTemplate: requiredString
})

export const ebayListingSchema = listingSchema.extend({
  itemId: z.string().optional(),
  listingType: requiredString,
  startPrice: requiredNumber,
  buyItNowPrice: requiredNumber,
  condition: requiredString,
  quantity: requiredInteger,
  title: requiredString
})

export const googleShoppingListingSchema =
  listingSchema.extend({
    offerId: requiredString,
    googleProductCategory: requiredString,
    targetCountry: requiredString,
    contentLanguage: requiredString,
    condition: requiredString,
    availability: requiredString
  })

export const metaMarketplaceListingSchema =
  listingSchema.extend({
    facebookCategoryId: requiredString,
    listingType: requiredString,
    condition: requiredString,
    location: requiredString,
    availability: requiredString
  })

export const shopifyListingSchema =
  listingSchema.extend({
    handle: requiredString,
    vendor: requiredString,
    productType: requiredString,
    tags: requiredString,
    optionName: requiredString,
    optionValue: requiredString
  })

export const etsyListingSchema =
  listingSchema.extend({
    taxonomyId: requiredString,
    whoMade: requiredString,
    whenMade: requiredString,
    isSupply: z.boolean(),
    shippingProfileId: requiredString
  })

export const tiktokShopListingSchema =
  listingSchema.extend({
    productCategoryId: requiredString,
    warehouseId: requiredString,
    packageWeight: requiredNumber,
    packageDimensions: requiredString,
    sellerSku: requiredString
  })

export const aliexpressListingSchema =
  listingSchema.extend({
    productGroupId: requiredString,
    logisticsTemplateId: requiredString,
    servicePolicyId: requiredString,
    categoryId: requiredString,
    shippingFrom: requiredString
  })

export const rakutenListingSchema =
  listingSchema.extend({
    shopSku: requiredString,
    genreId: requiredString,
    warehouseId: requiredString,
    deliverySetId: requiredString,
    pointRate: requiredNumber
  })

export const shopeeListingSchema =
  listingSchema.extend({
    itemSku: requiredString,
    categoryId: requiredString,
    logisticsChannelId: requiredString,
    condition: requiredString,
    weight: requiredNumber
  })

export const temuListingSchema =
  listingSchema.extend({
    goodsName: requiredString,
    categoryId: requiredString,
    warehouseRegion: requiredString,
    fulfillmentType: requiredString,
    manufacturerCode: requiredString
  })
