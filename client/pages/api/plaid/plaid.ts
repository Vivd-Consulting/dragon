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
  const accounts = await knex('accounting.account')
    .select(['account.id as id', 'account.name', 'bank.id as bank_id', 'token', 'cursor'])
    .where({ excluded: false })
    .join('accounting.bank', 'account.bank_id', 'bank.id')
    .whereIn('error', [null, '']);

  console.log('Accounts:', accounts.length);

  for (const account of accounts) {
    const { token, cursor } = account;

    let hasMore = true;

    while (hasMore) {
      const knexTransaction = await knex.transaction();

      try {
        // Get all transactions for this account
        const transaction = await fetchTransactions({
          token,
          cursor
        });
        const { added, removed, modified, cursor: lastCursor, hasMore: _hasMore } = transaction;

        hasMore = _hasMore;

        if (added.length > 0) {
          // Insert the transactions into the database
          const insertData = await Promise.all(
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
                applied_rule: rule?.id,
                category: transaction.category,
                gic_category_id: rule?.gic_id,
                tax_id: rule?.tax_id
              };
            })
          );

          if (insertData.length > 0) {
            await knex('accounting.transactions')
              .insert(insertData)
              .onConflict(['id'])
              .merge()
              .transacting(knexTransaction);
          } else {
            console.warn('No data to insert for account:', account.id);
          }
        }

        if (modified.length > 0) {
          const updateData = modified.map((transaction: any) => ({
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
          }));

          if (updateData.length > 0) {
            await knex('accounting.transactions')
              .update(updateData)
              .whereIn(
                'id',
                modified.map((transaction: any) => transaction.transaction_id)
              )
              .returning('*')
              .transacting(knexTransaction);
          } else {
            console.warn('No data to update for account:', account.id);
          }
        }

        if (removed.length > 0) {
          const removeIds = removed.map((transaction: any) => transaction.transaction_id);

          if (removeIds.length > 0) {
            await knex('accounting.transactions')
              .delete()
              .whereIn('id', removeIds)
              .transacting(knexTransaction);
          } else {
            console.warn('No data to remove for account:', account.id);
          }
        }

        // Update the cursor
        await knex('accounting.bank')
          .update({ cursor: lastCursor, updated_at: new Date() })
          .where({ token })
          .transacting(knexTransaction);

        await knexTransaction.commit();
      } catch (error: any) {
        await knexTransaction.rollback();
        await knex('accounting.bank').update({ error: error.message }).where({ token });
        console.error('Error processing account:', account.id, error);

        break;
      }
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

async function fetchTransactions({ token, cursor }) {
  // Iterate through each page of new transaction updates for item
  const request = {
    access_token: token,
    cursor: cursor
  };

  const response = await client.transactionsSync(request);

  if (response.status !== 200) {
    console.error(response);
    throw new Error(response.statusText);
  }

  const data = response.data;

  // New transaction updates since "cursor"
  const added: any[] = data.added;
  const modified: any[] = data.modified;

  // Removed transaction ids
  const removed: any[] = data.removed;
  const hasMore = data.has_more;

  cursor = data.next_cursor;

  return {
    added,
    removed,
    modified,
    cursor,
    hasMore
  };
}

async function getRule({ name, account_id, type }) {
  if (!name || !type || !account_id) {
    return null;
  }

  const query = knex('accounting.rules')
    .where(knex.raw('?', [name]), 'ilike', 'transaction_regex')
    .where({
      rule_type: type.toUpperCase(),
      deleted_at: null
    });

  if (account_id) {
    query.where({ account_id });
  }

  return await query.first();
}
