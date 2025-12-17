import { Knex } from 'knex';

/**
 * Consolidated accounting schema migration
 * Includes only tables needed for accounting functionality:
 * - Accounting tables (bank, account, category, transactions, rules, tax)
 * - Invoice tables (invoice, invoice_item)
 * - Minimal supporting tables (client, project, project_time) for invoices
 */
export async function up(knex: Knex): Promise<void> {
  // Create accounting schema
  await knex.raw('CREATE SCHEMA IF NOT EXISTS "accounting"');

  // Create rule_type enum
  await knex.raw("CREATE TYPE rule_type AS ENUM ('CREDIT', 'DEBIT')");

  // Minimal client table (needed for invoices)
  await knex.schema.createTable('client', (table) => {
    table.increments('id').primary();
    table.text('name').notNullable();
    table.timestamp('archived_at');
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
  });

  // Minimal project table (needed for invoices and project times)
  await knex.schema.createTable('project', (table) => {
    table.increments('id').primary();
    table.text('name').notNullable();
    table.integer('client_id').notNullable().references('id').inTable('client');
    table.timestamp('archived_at');
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
  });

  // Invoice tables (created before project_time so it can reference invoice)
  await knex.schema.createTable('invoice', (table) => {
    table.increments('id').primary();
    table.integer('client_id').references('id').inTable('client');
    table.integer('contractor_id'); // Keep for compatibility but not required
    table.timestamp('submitted_at');
    table.timestamp('due_date');
    table.timestamp('paid_at');
    table.timestamp('archived_at');
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
  });

  // Minimal project_time table (needed for invoice time tracking)
  await knex.schema.createTable('project_time', (table) => {
    table.increments('id').primary();
    table.text('dragon_user_id').notNullable(); // Keep as text for compatibility
    table.integer('project_id').notNullable().references('id').inTable('project');
    table.timestamp('start_time').notNullable();
    table.timestamp('end_time');
    table.text('description');
    table.float('new_time');
    table.integer('invoice_id').references('id').inTable('invoice');
    table.timestamp('deleted_at');
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
  });

  await knex.schema.createTable('invoice_item', (table) => {
    table.increments('id').primary();
    table.text('description');
    table.text('currency').notNullable().defaultTo('CAD');
    table.float('price').notNullable();
    table.float('tax').notNullable();
    table.integer('invoice_id').references('id').inTable('invoice');
    table.timestamp('deleted_at');
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
  });

  // Accounting: Bank table
  await knex.schema.withSchema('accounting').createTable('bank', (table) => {
    table.text('id').primary();
    table.text('name').notNullable();
    table.text('token');
    table.text('primary_color');
    table.text('logo');
    table.text('cursor');
    table.text('error');
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
  });

  // Accounting: Account table
  await knex.schema.withSchema('accounting').createTable('account', (table) => {
    table.text('id').primary();
    table.text('name').notNullable();
    table.text('bank_id').notNullable().references('id').inTable('accounting.bank');
    table.text('currency').notNullable();
    table.float('balance').notNullable();
    table.text('description');
    table.boolean('excluded').notNullable().defaultTo(false);
    table.boolean('is_business').notNullable().defaultTo(false);
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
  });

  // Accounting: Category table
  await knex.schema.withSchema('accounting').createTable('category', (table) => {
    table.increments('id').primary();
    table.text('name').notNullable();
    table.integer('gic');
    table.text('transaction_type').notNullable();
    table.boolean('is_business').notNullable().defaultTo(false);
  });

  // Accounting: Personal Finance Category table (for Plaid categorization)
  await knex.schema.withSchema('accounting').createTable('personal_finance_category', (table) => {
    table.integer('id').primary();
    table.text('category_group').notNullable();
    table.specificType('hierarchy', 'text[]').notNullable();
  });

  // Accounting: Tax table
  await knex.schema.withSchema('accounting').createTable('tax', (table) => {
    table.increments('id').primary();
    table.text('name').notNullable();
    table.float('rate').notNullable();
    table.text('country').notNullable();
    table.text('province').notNullable();
    table.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now());
    table.timestamp('updated_at', { useTz: true }).defaultTo(knex.fn.now());
  });

  // Accounting: Rules table
  await knex.schema.withSchema('accounting').createTable('rules', (table) => {
    table.increments('id').primary();
    table.text('name').notNullable();
    table.text('transaction_regex').notNullable();
    table.specificType('rule_type', 'rule_type').notNullable();
    table.integer('gic_id').references('id').inTable('accounting.category');
    table.text('account_id').references('id').inTable('accounting.account');
    table.integer('tax_id').references('id').inTable('accounting.tax');
    table.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now());
    table.timestamp('updated_at', { useTz: true }).defaultTo(knex.fn.now());
    table.timestamp('deleted_at', { useTz: true });
  });

  // Accounting: Transactions table
  await knex.schema.withSchema('accounting').createTable('transactions', (table) => {
    table.text('id').primary();
    table.text('account_id').notNullable().references('id').inTable('accounting.account');
    table.text('account_owner');
    table.float('credit');
    table.float('debit');
    table.timestamp('date').notNullable();
    table.text('currency').notNullable();
    table.jsonb('location');
    table.text('logo_url');
    table.text('merchant_name');
    table.text('name').notNullable();
    table.text('payment_channel');
    table.jsonb('payment_meta');
    table.text('personal_finance_category');
    table.text('personal_finance_category_confidence');
    table.text('personal_finance_category_icon_url');
    table.text('transaction_type');
    table.text('website');
    table.specificType('counterparties', 'jsonb[]');
    table.integer('gic_category_id').references('id').inTable('accounting.category');
    table.integer('category_id');
    table.specificType('category', 'text[]');
    table.integer('invoice_id').references('id').inTable('invoice');
    table.integer('invoice_item_id').references('id').inTable('invoice_item');
    table.integer('tax_id').references('id').inTable('accounting.tax');
    table.integer('applied_rule').references('id').inTable('accounting.rules');
    table.text('notes');
    table.text('related_transaction_id').references('id').inTable('accounting.transactions').onDelete('CASCADE');
    table.timestamp('deleted_at', { useTz: true });
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
  });

  // Accounting: Transaction recommendations (for transfer detection)
  await knex.schema.withSchema('accounting').createTable('transactions_recommendations', (table) => {
    table.increments('id').primary();
    table.text('transaction_id').references('id').inTable('accounting.transactions').onDelete('CASCADE');
    table.text('recommended_transaction_id').references('id').inTable('accounting.transactions').onDelete('CASCADE');
    table.unique(['transaction_id', 'recommended_transaction_id']);
  });
}

export async function down(knex: Knex): Promise<void> {
  // Drop in reverse order
  await knex.schema.withSchema('accounting').dropTableIfExists('transactions_recommendations');
  await knex.schema.withSchema('accounting').dropTableIfExists('transactions');
  await knex.schema.withSchema('accounting').dropTableIfExists('rules');
  await knex.schema.withSchema('accounting').dropTableIfExists('tax');
  await knex.schema.withSchema('accounting').dropTableIfExists('personal_finance_category');
  await knex.schema.withSchema('accounting').dropTableIfExists('category');
  await knex.schema.withSchema('accounting').dropTableIfExists('account');
  await knex.schema.withSchema('accounting').dropTableIfExists('bank');
  
  await knex.schema.dropTableIfExists('invoice_item');
  await knex.schema.dropTableIfExists('invoice');
  await knex.schema.dropTableIfExists('project_time');
  await knex.schema.dropTableIfExists('project');
  await knex.schema.dropTableIfExists('client');
  
  await knex.raw('DROP TYPE IF EXISTS rule_type');
  await knex.raw('DROP SCHEMA IF EXISTS "accounting" CASCADE');
}

