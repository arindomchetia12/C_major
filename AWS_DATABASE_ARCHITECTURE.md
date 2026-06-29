 # 🗄️ AWS Aurora PostgreSQL — Database Architecture & Integration Guide

This document provides a complete technical explanation of how **Amazon Aurora PostgreSQL (AWS RDS)** powers the **C major** platform, how data is queried via Drizzle ORM, and how network routing works.

---

## 🏗️ 1. High-Level AWS Database Architecture

The platform utilizes an **Amazon Aurora PostgreSQL Serverless / Managed Cluster** located in the AWS `us-east-1` (N. Virginia) region. Aurora provides enterprise-grade performance and automatic storage auto-scaling while remaining 100% compatible with standard PostgreSQL queries.

```mermaid
graph TD
    Client[💻 React Web App http://localhost:3000]
    Express[⚙️ Express API Server http://localhost:5000]
    Drizzle[🛠️ Drizzle ORM lib/db]
    AWS[☁️ AWS Aurora PostgreSQL Cluster us-east-1]
    S3[📁 AWS S3 Bucket storage]

    Client -- "HTTP GET /api/providers" --> Express
    Express -- "Import DB Pool" --> Drizzle
    Drizzle -- "TCP Port 5432 (SSL Required)" --> AWS
    AWS -- "Stores avatar_url references" --> S3
```

---

## 🔑 2. The Connection String Anatomy

The application connects to AWS Aurora using a highly secured, SSL-required connection string defined in your environment setups (`start-server.bat` and `check-aws-db.bat`).

```text
postgresql://postgres:IphoneXr20@database-2.cluster-cc90ckmyk1hb.us-east-1.rds.amazonaws.com:5432/c_major?sslmode=require
```

### Breakdown of the Components:
- **`postgresql://`**: The protocol adapter specifying the PostgreSQL database driver.
- **`postgres`**: The master database user account.
- **`IphoneXr20`**: The master password.
- **`database-2.cluster-cc90ckmyk1hb.us-east-1.rds.amazonaws.com`**: The public-facing Amazon RDS Aurora Cluster endpoint. This automatically balances queries across the primary database instance.
- **`:5432`**: The standard PostgreSQL TCP communications port.
- **`/c_major`**: The specific logical database housing your tables.
- **`?sslmode=require`**: Forces TLS/SSL encryption for all data traveling between your laptop and AWS servers, preventing packet sniffing.

---

## ⚙️ 3. How the Code Queries AWS Aurora

Unlike legacy projects that write raw SQL strings (which are prone to SQL injection and typos), C major utilizes **Drizzle ORM** inside the `lib/db` package.

### Step 1: Defining Tables in TypeScript (`lib/db/src/schema/providers.ts`)
We map the exact structure of the AWS PostgreSQL tables into TypeScript models.

```typescript
import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const providers = pgTable("providers", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  trade: text("trade").notNull(),
  location: text("location").notNull(),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
```

### Step 2: Executing Queries in Express (`artifacts/api-server/src/routes/providers.ts`)
When the frontend requests professional listings, Express calls Drizzle ORM to fetch the data from AWS instantly.

```typescript
// Example from your API routes
import { db } from "@cmajor/db";
import { providers } from "@cmajor/db/schema";
import { desc } from "drizzle-orm";

app.get("/api/providers", async (req, res) => {
  // Drizzle compiles this into: SELECT * FROM providers ORDER BY created_at DESC;
  const list = await db.select().from(providers).orderBy(desc(providers.createdAt));
  res.json(list);
});
```

---

## 📜 4. Database Initialization & Seeding Scripts

Your project includes native Windows automation scripts to set up, rebuild, or test your AWS Aurora database in seconds.

```text
scripts/
 ├── 📜 schema.sql          ← SQL commands defining your raw tables (providers, reviews)
 ├── 📜 seed.sql            ← Initial batch of mock pro profiles (Marcus Rivera, Dave Miller)
 ├── ⚡ apply-schema.bat    ← Applies schema.sql directly to AWS Aurora using psql.exe
 ├── ⚡ apply-seed.bat      ← Injects seed.sql directly into AWS Aurora
 └── 🔍 check-aws-db.bat    ← Verifies network latency, port accessibility, and login credentials
```

---

## 🛡️ 5. Network Requirements & The Hotspot Principle

### ⚠️ The Port 5432 Firewall Problem
Because AWS Aurora communicates over **TCP Port 5432**, many enterprise, corporate, or college Wi-Fi networks actively block outgoing connections on this port for security reasons. 
- **If Port 5432 is blocked:** Your Express API server will throw a `500 Internal Server Error` with `ETIMEDOUT` or `Connection terminated unexpectedly` when you visit `/api/providers`.

### ✅ The Mobile Hotspot Solution
To bypass strict corporate firewalls, you connect your laptop to your **iPhone Mobile Hotspot** (`172.20.10.5`). 
- Cellular networks do not enforce outbound port filtering.
- By switching to your hotspot and launching `start-server.bat`, your Express server establishes a direct, unimpeded TCP tunnel directly to AWS Aurora in `us-east-1`!

---

## 🌟 6. Future AWS S3 Image Integration

Currently, the `avatar_url` column in the `providers` table holds direct image URLs. 
When you transition to direct user uploads:
1. The user selects a profile image in the React form.
2. The image gets uploaded directly to an **Amazon S3 Bucket**.
3. S3 returns a permanent secure URL (e.g. `https://my-bucket.s3.amazonaws.com/image.jpg`).
4. That S3 URL is stored directly in the `avatar_url` column in **AWS Aurora**. 

*No changes to the SQL table schema are required to support S3 uploads!*
