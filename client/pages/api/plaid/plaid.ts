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
    .select(['account.id as id', 'account.name', 'bank.id as bank_id', 'token'])
    .where({ excluded: false })
    .join('accounting.bank', 'account.bank_id', 'bank.id')
    .where('error', null)
    .orWhere('error', '');

  for (const account of accounts) {
    const { token } = account;

    let hasMore = true;

    while (hasMore) {
      const bank = await knex('accounting.bank')
        .where({ token })
        .where('error', null)
        .orWhere('error', '')
        .first();

      if (!bank) {
        console.warn(`(${account.name}) No bank found for token: ${token}`);
        break;
      }

      const { cursor } = bank;

      const knexTransaction = await knex.transaction();

      try {
        // Get all transactions for this account
        const transaction = await fetchTransactions({
          token,
          cursor
        });

        if (!transaction) {
          console.warn('No transactions to process for account:', account.id);
          break;
        }

        const { added, removed, modified, cursor: lastCursor, hasMore: _hasMore } = transaction;

        hasMore = _hasMore;

        if (added.length > 0) {
          // Insert the transactions into the database
          const insertData = await Promise.all(
            added.map(async (transaction: any) => {
              const credit = transaction.amount < 0 ? transaction.amount : null;
              const debit = transaction.amount > 0 ? transaction.amount : null;

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
                category: transaction.category
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
            const updateIds = updateData.map((transaction: any) => transaction.id);

            for (const data of updateData) {
              await knex('accounting.transactions')
                .update(data)
                .whereIn('id', updateIds)
                .returning('*')
                .transacting(knexTransaction);
            }
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

        await applyRules(knexTransaction);

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

async function applyRules(knexTransaction) {
  const rules = await knex('accounting.rules').where({ deleted_at: null });

  for (const rule of rules) {
    const query = knex('accounting.transactions')
      .update({ gic_category_id: rule.gic_id, applied_rule: rule.id, tax_id: rule.tax_id })
      .where({ gic_category_id: null })
      .where('name', 'ILIKE', rule.transaction_regex)
      .transacting(knexTransaction);

    if (rule.account_id) {
      query.where({ account_id: rule.account_id });
    }

    await query;
  }
}
