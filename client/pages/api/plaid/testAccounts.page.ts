import knex from '../db';

import { client } from './plaid';

export default async function handler(request, response) {
  const accounts = await knex('accounting.bank').select('name', 'token');

  const responses = {};

  for (const account of accounts) {
    try {
      const accountsRequest = await client.accountsGet({
        access_token: account.token
      });

      responses[account.name] = accountsRequest.data.accounts;

      await knex('accounting.bank')
        .update({
          error: null
        })
        .where({
          token: account.token
        });
    } catch (error: any) {
      responses[account.name] = error.message;

      await knex('accounting.bank')
        .update({
          error: error.message
        })
        .where({
          token: account.token
        });
    }
  }

  response.json({ responses });
}
