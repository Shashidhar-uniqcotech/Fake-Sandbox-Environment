CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'ListingStatus'
  ) THEN
    CREATE TYPE "ListingStatus" AS ENUM (
      'DRAFT',
      'SUBMITTED',
      'VALIDATING',
      'PROCESSING',
      'DISCOVERABLE',
      'VALIDATION_FAILED',
      'PROCESSING_FAILED'
    );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'EmulatorEventName'
  ) THEN
    CREATE TYPE "EmulatorEventName" AS ENUM (
      'LISTING_CREATED',
      'LISTING_VALIDATED',
      'LISTING_DISCOVERABLE',
      'INVENTORY_UPDATED',
      'WEBHOOK_DELIVERED',
      'WEBHOOK_FAILED'
    );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'ResourceType'
  ) THEN
    CREATE TYPE "ResourceType" AS ENUM (
      'listing',
      'inventory',
      'webhook'
    );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'WebhookDeliveryStatus'
  ) THEN
    CREATE TYPE "WebhookDeliveryStatus" AS ENUM (
      'PENDING',
      'DELIVERED',
      'FAILED'
    );
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS "listings" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "sellerId" TEXT NOT NULL,
  "sku" TEXT NOT NULL,
  "submissionId" TEXT NOT NULL,
  "status" "ListingStatus" NOT NULL DEFAULT 'SUBMITTED',
  "payload" JSONB NOT NULL,
  "webhookUrl" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "inventory" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "platform" TEXT NOT NULL DEFAULT 'flipkart',
  "sku" TEXT NOT NULL,
  "quantity" INTEGER NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "events" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "event" "EmulatorEventName" NOT NULL,
  "resourceType" "ResourceType" NOT NULL,
  "resourceId" TEXT NOT NULL,
  "payload" JSONB NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "webhook_deliveries" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "url" TEXT NOT NULL,
  "event" TEXT NOT NULL,
  "payload" JSONB NOT NULL,
  "status" "WebhookDeliveryStatus" NOT NULL DEFAULT 'PENDING',
  "attempts" INTEGER NOT NULL DEFAULT 0,
  "lastStatusCode" INTEGER,
  "lastError" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "request_logs" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "method" TEXT NOT NULL,
  "url" TEXT NOT NULL,
  "timestamp" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "responseTimeMs" INTEGER NOT NULL,
  "statusCode" INTEGER NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "listings_submissionId_key"
  ON "listings" ("submissionId");

CREATE UNIQUE INDEX IF NOT EXISTS "listings_sellerId_sku_key"
  ON "listings" ("sellerId", "sku");

CREATE INDEX IF NOT EXISTS "listings_sku_idx"
  ON "listings" ("sku");

CREATE INDEX IF NOT EXISTS "listings_sellerId_idx"
  ON "listings" ("sellerId");

CREATE INDEX IF NOT EXISTS "listings_status_idx"
  ON "listings" ("status");

CREATE UNIQUE INDEX IF NOT EXISTS "inventory_platform_sku_key"
  ON "inventory" ("platform", "sku");

CREATE INDEX IF NOT EXISTS "inventory_platform_idx"
  ON "inventory" ("platform");

CREATE INDEX IF NOT EXISTS "inventory_sku_idx"
  ON "inventory" ("sku");

CREATE INDEX IF NOT EXISTS "events_event_idx"
  ON "events" ("event");

CREATE INDEX IF NOT EXISTS "events_resource_idx"
  ON "events" ("resourceType", "resourceId");

CREATE INDEX IF NOT EXISTS "events_createdAt_idx"
  ON "events" ("createdAt");

CREATE INDEX IF NOT EXISTS "webhook_deliveries_status_idx"
  ON "webhook_deliveries" ("status");

CREATE INDEX IF NOT EXISTS "webhook_deliveries_event_idx"
  ON "webhook_deliveries" ("event");

CREATE INDEX IF NOT EXISTS "webhook_deliveries_createdAt_idx"
  ON "webhook_deliveries" ("createdAt");

CREATE INDEX IF NOT EXISTS "request_logs_timestamp_idx"
  ON "request_logs" ("timestamp");

CREATE INDEX IF NOT EXISTS "request_logs_statusCode_idx"
  ON "request_logs" ("statusCode");
