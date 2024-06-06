import knex from '../db';

import { verifyJwt } from '../verfiyJwt';

import { client } from './plaid';

export default async function handler(request, response) {
  try {
    await verifyJwt(request);

    // TODO: newToken is a public-access token???
    const { oldToken, newToken } = request.body;

    const dbTransaction = await knex.transaction();

    const bank = await knex('accounting.bank')
      .select('id')
      .where({ token: oldToken })
      .first()
      .transacting(dbTransaction);

    const accountsRequest = await client.accountsGet({
      access_token: oldToken
    });
    const accounts = accountsRequest.data.accounts;

    await knex('accounting.account')
      .insert(
        accounts.map(account => ({
          id: account.account_id,
          name: account.name,
          bank_id: bank.id,
          currency: account.balances.iso_currency_code,
          balance: account.balances.current,
          description: `${account.official_name || ''} ${account.type}`
        }))
      )
      // On conflict, overwrite the existing record
      .onConflict('id')
      .merge()
      .transacting(dbTransaction);

    // Find the matching bank account in the database, and remove the error status
    await knex('accounting.bank')
      .update({ error: null })
      .where({ token: oldToken })
      .transacting(dbTransaction);

    await dbTransaction.commit();

    response.json({ success: true });
  } catch (error: any) {
    console.error({ error });

    response.status(500).json({ error: error.message });
  }
}
