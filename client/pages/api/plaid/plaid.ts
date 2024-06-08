import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid';

import knex from '../db';

const PLAID_CLIENT_ID = process.env.PLAID_CLIENT_ID;
const PLAID_SECRET = process.env.PLAID_SECRET;
const PLAID_ENV = process.env.PLAID_ENV || 'sandbox';

const configuration = new Configuration({
  basePath: PlaidEnvironments[PLAID_ENV],
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': PLAID_CLIENT_ID,
      'PLAID-SECRET': PLAID_SECRET,
      'Plaid-Version': '2020-09-14'
    }
  }
});

export const client = new PlaidApi(configuration);

export async function backfillTransactions() {
  const knexTransaction = await knex.transaction();

  // Get all the accounts with their bank info
  const accounts = await knex('accounting.account')
    .select(['account.id as id', 'account.name', 'bank.id as bank_id', 'token', 'cursor'])
    .where({ excluded: false })
    .join('accounting.bank', 'account.bank_id', 'bank.id')
    .where({ error: null });

  for (const account of accounts) {
    const { token, cursor } = account;

    // Get all transactions for this account
    try {
      const transaction = await fetchTransactions({ token, cursor, knexTransaction });
      const { added, removed, modified } = transaction;

      if (added.length > 0) {
        // Insert the transactions into the database
        await knex('accounting.transactions')
          .insert(
            added.map(async (transaction: any) => {
              const credit = transaction.amount < 0 ? transaction.amount : null;
              const debit = transaction.amount > 0 ? transaction.amount : null;

              const isDebit = debit && debit > 0;
              const type = isDebit ? 'DEBIT' : 'CREDIT';

              const rule = await getRule({
                name: transaction.name,
                account_id: transaction.account_id,
                type
              });

              console.log({ rule });

              return {
                account_id: transaction.account_id,
                account_owner: transaction.account_owner,
                credit,
                debit,
                date: transaction.datetime || transaction.date,
                currency: transaction.iso_currency_code,
                location: transaction.location,
                logo_url: transaction.logo_url,
                merchant_name: transaction.merchant_name,
                name: transaction.name,
                payment_channel: transaction.payment_channel,
                payment_meta: transaction.payment_meta,
                personal_finance_category: transaction.detailed,
                personal_finance_category_confidence: transaction.confidence_level,
                personal_finance_category_icon_url: transaction.personal_finance_category_icon_url,
                id: transaction.transaction_id,
                transaction_type: transaction.transaction_type,
                website: transaction.website,
                counterparties: transaction.counterparties,
                category_id: transaction.category_id,
                category: transaction.category,
                gic_category_id: rule?.gic_id,
                tax_id: rule?.tax_id
              };
            })
          )
          .onConflict(['id'])
          .merge()
          .transacting(knexTransaction);
      }

      if (modified.length > 0) {
        // Update the transactions in the database
        await knex('accounting.transactions')
          .update(
            modified.map((transaction: any) => ({
              account_id: transaction.account_id,
              account_owner: transaction.account_owner,
              credit: transaction.amount < 0 ? transaction.amount : null,
              debit: transaction.amount > 0 ? transaction.amount : null,
              date: transaction.datetime || transaction.date,
              currency: transaction.iso_currency_code,
              location: transaction.location,
              logo_url: transaction.logo_url,
              merchant_name: transaction.merchant_name,
              name: transaction.name,
              payment_channel: transaction.payment_channel,
              payment_meta: transaction.payment_meta,
              personal_finance_category: transaction.detailed,
              personal_finance_category_confidence: transaction.confidence_level,
              personal_finance_category_icon_url: transaction.personal_finance_category_icon_url,
              id: transaction.transaction_id,
              transaction_type: transaction.transaction_type,
              website: transaction.website,
              counterparties: transaction.counterparties,
              category_id: transaction.category_id,
              category: transaction.category,
              updated_at: new Date()
            }))
          )
          .whereIn(
            'id',
            modified.map((transaction: any) => transaction.transaction_id)
          )
          .returning('*')
          .transacting(knexTransaction);
      }

      if (removed.length > 0) {
        // Remove the transactions from the database
        await knex('accounting.transactions')
          .delete()
          .whereIn(
            'id',
            removed.map((transaction: any) => transaction.transaction_id)
          )
          .transacting(knexTransaction);
      }

      // Update the cursor
      await knex('accounting.bank')
        .update({ cursor, updated_at: new Date() })
        .where({ token })
        .transacting(knexTransaction);

      await knexTransaction.commit();
    } catch (error: any) {
      await knex('accounting.bank').update({ error: error.message }).where({ token });
      throw new Error(error);
    }
  }
}

export async function getCategories() {
  const categories = await client.categoriesGet({});

  const insertedCategories = await knex('accounting.personal_finance_category')
    .insert(
      categories.data.categories.map(({ category_id, group, hierarchy }) => ({
        id: category_id,
        category_group: group,
        hierarchy
      }))
    )
    .returning('*')
    .onConflict(['id'])
    .ignore();

  return insertedCategories;
}

async function fetchTransactions({ token, cursor, knexTransaction }) {
  // New transaction updates since "cursor"
  let added: any[] = [];
  let modified: any[] = [];

  // Removed transaction ids
  let removed: any[] = [];
  let hasMore = true;

  // Iterate through each page of new transaction updates for item
  while (hasMore) {
    const request = {
      access_token: token,
      cursor: cursor
    };

    const response = await client.transactionsSync(request);

    if (response.status !== 200) {
      throw new Error(response.statusText);
    }

    const data = response.data;

    // Add this page of results
    added = added.concat(data.added);
    modified = modified.concat(data.modified);
    removed = removed.concat(data.removed);
    hasMore = data.has_more;
    // Update cursor to the next cursor
    cursor = data.next_cursor;

    await knex('accounting.bank')
      .update({
        cursor,
        updated_at: new Date()
      })
      .where({ token })
      .transacting(knexTransaction);
  }

  return {
    added,
    removed,
    modified
  };
}

async function getRule({ name, account_id, type }) {
  if (!name || !type || !account_id) {
    return null;
  }

  const query = knex('accounting.rules').where('transaction_regex', 'ILIKE', name).where({
    rule_type: type.toUpperCase(),
    deleted_at: null
  });

  if (account_id) {
    query.where({ account_id });
  }

  return await query.first();
}
