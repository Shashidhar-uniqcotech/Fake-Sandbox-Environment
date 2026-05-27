CREATE TABLE IF NOT EXISTS "listings_flipkart" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "sellerId" TEXT NOT NULL,
  "sku" TEXT NOT NULL,
  "channelSkuId" TEXT,
  "productId" TEXT,
  "submissionId" TEXT NOT NULL,
  "status" "ListingStatus" NOT NULL DEFAULT 'SUBMITTED',
  "price" DOUBLE PRECISION,
  "quantity" INTEGER,
  "hsn" TEXT,
  "gstRate" DOUBLE PRECISION,
  "fulfillment" TEXT,
  "payload" JSONB NOT NULL,
  "webhookUrl" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "listings_walmart" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "sellerId" TEXT NOT NULL,
  "sku" TEXT NOT NULL,
  "itemId" TEXT,
  "submissionId" TEXT NOT NULL,
  "status" "ListingStatus" NOT NULL DEFAULT 'SUBMITTED',
  "price" DOUBLE PRECISION,
  "quantity" INTEGER,
  "upc" TEXT,
  "mpn" TEXT,
  "brand" TEXT,
  "shippingTemplate" TEXT,
  "payload" JSONB NOT NULL,
  "webhookUrl" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "listings_ebay" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "sellerId" TEXT NOT NULL,
  "sku" TEXT NOT NULL,
  "itemId" TEXT,
  "submissionId" TEXT NOT NULL,
  "status" "ListingStatus" NOT NULL DEFAULT 'SUBMITTED',
  "listingType" TEXT,
  "startPrice" DOUBLE PRECISION,
  "buyItNowPrice" DOUBLE PRECISION,
  "condition" TEXT,
  "quantity" INTEGER,
  "title" TEXT,
  "payload" JSONB NOT NULL,
  "webhookUrl" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "listings_marketplace" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "platform" TEXT NOT NULL,
  "sellerId" TEXT NOT NULL,
  "sku" TEXT NOT NULL,
  "submissionId" TEXT NOT NULL,
  "status" "ListingStatus" NOT NULL DEFAULT 'SUBMITTED',
  "price" DOUBLE PRECISION,
  "quantity" INTEGER,
  "title" TEXT,
  "brand" TEXT,
  "payload" JSONB NOT NULL,
  "webhookUrl" TEXT,
  "platformFields" JSONB NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS "listings_flipkart_submissionId_key"
  ON "listings_flipkart" ("submissionId");
CREATE UNIQUE INDEX IF NOT EXISTS "listings_flipkart_sellerId_sku_key"
  ON "listings_flipkart" ("sellerId", "sku");
CREATE INDEX IF NOT EXISTS "listings_flipkart_sku_idx"
  ON "listings_flipkart" ("sku");
CREATE INDEX IF NOT EXISTS "listings_flipkart_sellerId_idx"
  ON "listings_flipkart" ("sellerId");
CREATE INDEX IF NOT EXISTS "listings_flipkart_status_idx"
  ON "listings_flipkart" ("status");

CREATE UNIQUE INDEX IF NOT EXISTS "listings_walmart_submissionId_key"
  ON "listings_walmart" ("submissionId");
CREATE UNIQUE INDEX IF NOT EXISTS "listings_walmart_sellerId_sku_key"
  ON "listings_walmart" ("sellerId", "sku");
CREATE INDEX IF NOT EXISTS "listings_walmart_sku_idx"
  ON "listings_walmart" ("sku");
CREATE INDEX IF NOT EXISTS "listings_walmart_sellerId_idx"
  ON "listings_walmart" ("sellerId");
CREATE INDEX IF NOT EXISTS "listings_walmart_status_idx"
  ON "listings_walmart" ("status");

CREATE UNIQUE INDEX IF NOT EXISTS "listings_ebay_submissionId_key"
  ON "listings_ebay" ("submissionId");
CREATE UNIQUE INDEX IF NOT EXISTS "listings_ebay_sellerId_sku_key"
  ON "listings_ebay" ("sellerId", "sku");
CREATE INDEX IF NOT EXISTS "listings_ebay_sku_idx"
  ON "listings_ebay" ("sku");
CREATE INDEX IF NOT EXISTS "listings_ebay_sellerId_idx"
  ON "listings_ebay" ("sellerId");
CREATE INDEX IF NOT EXISTS "listings_ebay_status_idx"
  ON "listings_ebay" ("status");

CREATE UNIQUE INDEX IF NOT EXISTS "listings_marketplace_submissionId_key"
  ON "listings_marketplace" ("submissionId");
CREATE UNIQUE INDEX IF NOT EXISTS "listings_marketplace_platform_sellerId_sku_key"
  ON "listings_marketplace" ("platform", "sellerId", "sku");
CREATE INDEX IF NOT EXISTS "listings_marketplace_platform_idx"
  ON "listings_marketplace" ("platform");
CREATE INDEX IF NOT EXISTS "listings_marketplace_sku_idx"
  ON "listings_marketplace" ("sku");
CREATE INDEX IF NOT EXISTS "listings_marketplace_sellerId_idx"
  ON "listings_marketplace" ("sellerId");
CREATE INDEX IF NOT EXISTS "listings_marketplace_status_idx"
  ON "listings_marketplace" ("status");
