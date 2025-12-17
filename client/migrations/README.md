# Database Migrations

Migrations are managed using **Knex**.

## Migration Location

Migrations are stored in: `client/migrations/`

## Available Commands

### Create a new migration
```bash
yarn migrate:make migration_name
```

This creates a new TypeScript migration file in `client/migrations/` with `up` and `down` functions.

### Run pending migrations
```bash
yarn migrate:latest
```

### Rollback the last migration
```bash
yarn migrate:rollback
```

### Check migration status
```bash
yarn migrate:status
```

## Migration File Structure

Example migration file:

```typescript
import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('users', (table) => {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('users');
}
```

## Current Schema

The project uses a single consolidated migration (`001_accounting_schema.ts`) that includes:

### Accounting Tables (in `accounting` schema):
- `bank` - Bank connections (Plaid)
- `account` - Bank accounts
- `category` - Transaction categories
- `personal_finance_category` - Plaid categorization data
- `tax` - Tax rates
- `rules` - Auto-categorization rules
- `transactions` - Financial transactions
- `transactions_recommendations` - Transfer detection

### Invoice Tables:
- `invoice` - Invoices
- `invoice_item` - Invoice line items

### Supporting Tables (minimal, for invoices):
- `client` - Clients (minimal: id, name only)
- `project` - Projects (minimal: id, name, client_id only)
- `project_time` - Time entries for invoicing

## Configuration

Migration configuration is in `client/knexfile.ts`. It uses the `DATABASE_URL` environment variable for connection.

## TypeScript Support

Migrations are written in TypeScript and executed using `tsx`. Make sure `tsx` is installed as a dev dependency.

