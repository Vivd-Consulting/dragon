import knex from './db.js';

import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid';

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

const client = new PlaidApi(configuration);

export async function backfillTransactions() {
  // Get all the accounts with their bank info
  const accounts = await knex('accounting.account')
    .select([
      'account.id as id',
      'account.name',
      'bank.id as bank_id',
      'token',
      'cursor'
    ])
    .where({ excluded: false })
    .join('accounting.bank', 'account.bank_id', 'bank.id');

  let transactions = [];

  for (const account of accounts) {
    const { token, cursor } = account;

    // Get all transactions for this account
    const transaction = await fetchTransactions({ token, cursor });
    const { added, removed, modified } = transaction;

    // Insert the transactions into the database
    const insertedTransactions = await knex('accounting.transactions')
      .insert(
        added.map((transaction) => ({
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
          personal_finance_category_icon_url:
            transaction.personal_finance_category_icon_url,
          id: transaction.transaction_id,
          transaction_type: transaction.transaction_type,
          website: transaction.website,
          counterparties: transaction.counterparties,
          category_id: transaction.category_id,
          category: transaction.category
        }))
      )
      .onConflict(['id'])
      .merge()
      .returning('*');

    transactions = transactions.concat(insertedTransactions);

    await knex('accounting.bank').update({ cursor }).where({ token });

    // // Update the cursor for the account
    // await knex('accounting.account')
    //   .update({ cursor: insertedTransactions[0].id })
    //   .where({ id: account.id });
  }

  return transactions;
}

export async function getCategories() {
  const categories = await client.categoriesGet({});

  const insertedCategories = await knex('accounting.personal_finance_category').insert(
    categories.data.categories.map(({ category_id, group, hierarchy }) => ({
      id: category_id,
      category_group: group,
      hierarchy
    }))
  ).returning('*')
  .onConflict(['id'])
  .ignore();

  return insertedCategories;
}

async function fetchTransactions({ token, cursor }) {
  // New transaction updates since "cursor"
  let added = [];
  let modified = [];

  // Removed transaction ids
  let removed = [];
  let hasMore = true;

  // Iterate through each page of new transaction updates for item
  while (hasMore) {
    const request = {
      access_token: token,
      cursor: cursor
    };
    const response = await client.transactionsSync(request);
    const data = response.data;

    // Add this page of results
    added = added.concat(data.added);
    modified = modified.concat(data.modified);
    removed = removed.concat(data.removed);
    hasMore = data.has_more;
    // Update cursor to the next cursor
    cursor = data.next_cursor;
  }

  return {
    added,
    removed,
    modified
  };
}
