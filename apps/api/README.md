# Zurich Customer Billing Portal — API

A RESTful API built with [NestJS](https://nestjs.com/) that manages customer billing data for the Zurich Customer Portal. It provides full CRUD operations on customer records with JWT-based authentication, role-based access control, pagination, filtering, rate limiting, and response caching.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [Getting Started](#getting-started)
- [Authentication](#authentication)
- [API Endpoints](#api-endpoints)
- [Data Model](#data-model)
- [Roles & Permissions](#roles--permissions)
- [Scripts](#scripts)

---

## Tech Stack

| Layer          | Technology                          |
|----------------|-------------------------------------|
| Framework      | NestJS 11                           |
| Language       | TypeScript 5                        |
| Database       | PostgreSQL (via TypeORM)            |
| Auth           | JWT + Passport                      |
| Validation     | class-validator / class-transformer |
| Docs           | Swagger / OpenAPI                   |
| Rate Limiting  | @nestjs/throttler                   |
| Caching        | @nestjs/cache-manager (in-memory)   |
| Compression    | compression (gzip)                  |
| Package Mgr    | pnpm (workspace)                    |

---

## Project Structure

```
apps/api/
├── src/
│   ├── main.ts                    # Bootstrap — Swagger, validation pipe, compression
│   ├── app.module.ts              # Root module — DB, throttler, cache, middleware
│   ├── auth/
│   │   ├── auth.module.ts         # JWT strategy registration
│   │   ├── jwt-auth.guard.ts      # Guard — validates Bearer token on every request
│   │   └── jwt.strategy.ts        # Passport strategy — validates JWT and extracts payload
│   ├── common/
│   │   ├── decorators/
│   │   │   └── roles.decorator.ts # @Roles() metadata decorator
│   │   ├── guards/
│   │   │   └── roles.guard.ts     # Guard — enforces role metadata on routes
│   │   └── middleware/
│   │       └── logger.middleware.ts # HTTP request logger
│   ├── customers/
│   │   ├── customers.module.ts
│   │   ├── customers.controller.ts # Route handlers with auth guards
│   │   ├── customers.service.ts    # Business logic — CRUD, pagination, conflict checks
│   │   ├── dto/
│   │   │   ├── create-customer.dto.ts
│   │   │   ├── update-customer.dto.ts
│   │   │   ├── query-customers.dto.ts   # Pagination + filter query params
│   │   │   ├── customer-response.dto.ts
│   │   │   └── paginated-customers.dto.ts
│   │   └── entities/
│   │       └── customer.entity.ts  # TypeORM entity — maps to `customers` table
│   └── database/
│       └── seed.ts                # Standalone seed script (run via pnpm seed)
├── scripts/
│   └── generate-token.ts          # Dev utility — prints signed JWTs for testing
├── .env                           # Local environment variables (not committed)
├── .env.example                   # Template for environment variables
├── nest-cli.json                  # NestJS CLI config
└── tsconfig.json                  # TypeScript config

packages/shared/                   # Shared types/enums used across the monorepo
├── src/
│   ├── enums/
│   │   ├── location.enum.ts       # Location.WEST_MALAYSIA | EAST_MALAYSIA
│   │   └── role.enum.ts           # Role.ADMIN | Role.USER
│   └── types/
│       └── customer.types.ts      # ICustomer, IJwtPayload, IPaginatedResponse
```

---

## Environment Variables

Copy `.env.example` to `.env` and fill in the values:

```env
# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=CUSTOMER_BILLING_PORTAL

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=1d

# App
PORT=3000
NODE_ENV=development

# Comma-separated emails granted the admin role
ADMIN_EMAILS=admin@zurich.com
```

---

## Getting Started

### Prerequisites

- Node.js >= 18
- pnpm >= 9
- PostgreSQL running locally

### 1. Install dependencies (from monorepo root)

```bash
pnpm install
```

### 2. Set up the database

If you are using a fresh PostgreSQL installation, create the required role and database:

```bash
psql -c "CREATE ROLE postgres WITH LOGIN SUPERUSER PASSWORD 'postgres';"
psql -c 'CREATE DATABASE "CUSTOMER_BILLING_PORTAL" OWNER postgres;'
```

### 3. Seed sample data

```bash
pnpm --filter @zurich/api run seed
```

### 4. Start the API

```bash
pnpm --filter @zurich/api run start:dev
```

The API will be available at:

- **API:** http://localhost:3000
- **Swagger UI:** http://localhost:3000/api/docs

> The database schema is auto-synced on startup in `development` mode via TypeORM `synchronize: true`.

---

## Authentication

All endpoints require a valid **JWT Bearer token**.

### Generate a dev token

```bash
pnpm --filter @zurich/api run token:generate
```

This prints two tokens — one for `admin` and one for `user` — each valid for 24 hours.

### Use in Swagger

1. Open http://localhost:3000/api/docs
2. Click **Authorize**
3. Paste: `Bearer <token>`

### Use with curl

```bash
curl -H "Authorization: Bearer <token>" http://localhost:3000/customers
```

### JWT Payload

```json
{
  "sub": "dev-admin",
  "role": "admin"
}
```

---

## API Endpoints

All routes are prefixed with `/customers`.

| Method   | Path             | Role        | Description                              |
|----------|------------------|-------------|------------------------------------------|
| `POST`   | `/customers`     | Admin only  | Create a new customer                    |
| `GET`    | `/customers`     | Admin, User | List all customers (paginated, filtered) |
| `GET`    | `/customers/:id` | Admin, User | Get a single customer by UUID            |
| `PATCH`  | `/customers/:id` | Admin only  | Update customer details                  |
| `DELETE` | `/customers/:id` | Admin only  | Delete a customer                        |

### Query parameters for `GET /customers`

| Param       | Type   | Description                                   |
|-------------|--------|-----------------------------------------------|
| `page`      | number | Page number, 1-based (default: `1`)           |
| `limit`     | number | Items per page, max 100 (default: `10`)       |
| `location`  | enum   | Filter by `West Malaysia` or `East Malaysia`  |
| `productId` | string | Filter by product ID (e.g. `4000`, `5000`)    |

### Example paginated response

```json
{
  "data": [...],
  "total": 42,
  "page": 1,
  "limit": 10,
  "totalPages": 5
}
```

---

## Data Model

### `customers` table

| Column         | Type           | Notes                              |
|----------------|----------------|------------------------------------|
| `id`           | UUID (PK)      | Auto-generated                     |
| `email`        | varchar(255)   | Unique, indexed                    |
| `first_name`   | varchar(100)   |                                    |
| `last_name`    | varchar(100)   |                                    |
| `photo`        | varchar(500)   | URL to profile photo               |
| `product_id`   | varchar(50)    |                                    |
| `location`     | enum           | `West Malaysia` or `East Malaysia` |
| `premium_paid` | decimal(10, 2) | Default `0.00`                     |
| `created_at`   | timestamp      | Auto-set on insert                 |
| `updated_at`   | timestamp      | Auto-set on update                 |

---

## Roles & Permissions

| Action          | `admin` | `user` |
|-----------------|---------|--------|
| Create customer | Yes     | No     |
| List customers  | Yes     | Yes    |
| Get customer    | Yes     | Yes    |
| Update customer | Yes     | No     |
| Delete customer | Yes     | No     |

Role is read from the `role` field in the JWT payload. No database lookup is performed.

---

## Scripts

Run from the `apps/api` directory or prefix with `pnpm --filter @zurich/api run`:

| Script           | Description                                          |
|------------------|------------------------------------------------------|
| `start:dev`      | Start in watch mode (auto-recompile on file changes) |
| `build`          | Compile TypeScript to `dist/`                        |
| `start:prod`     | Run compiled output (requires `build` first)         |
| `seed`           | Seed the database with sample customers              |
| `token:generate` | Print dev JWT tokens for Swagger / curl testing      |
| `test`           | Run unit tests                                       |
| `test:cov`       | Run unit tests with coverage report (>=80% required) |
| `test:e2e`       | Run end-to-end tests                                 |
| `lint`           | Lint and auto-fix source files                       |
