CREATE TABLE IF NOT EXISTS "providers" (
  "id" serial PRIMARY KEY,
  "name" text NOT NULL,
  "trade" text NOT NULL,
  "city" text NOT NULL,
  "state" text NOT NULL,
  "bio" text NOT NULL,
  "phone" text NOT NULL,
  "email" text,
  "avatar_url" text,
  "years_experience" integer,
  "hourly_rate" real,
  "is_verified" boolean NOT NULL DEFAULT false,
  "created_at" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "portfolio_items" (
  "id" serial PRIMARY KEY,
  "provider_id" integer NOT NULL REFERENCES "providers"("id") ON DELETE CASCADE,
  "image_url" text NOT NULL,
  "caption" text NOT NULL,
  "created_at" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "reviews" (
  "id" serial PRIMARY KEY,
  "provider_id" integer NOT NULL REFERENCES "providers"("id") ON DELETE CASCADE,
  "reviewer_name" text NOT NULL,
  "rating" integer NOT NULL,
  "comment" text NOT NULL,
  "created_at" timestamp NOT NULL DEFAULT now()
);
