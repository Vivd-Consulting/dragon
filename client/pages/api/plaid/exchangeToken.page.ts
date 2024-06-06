import { CountryCode } from 'plaid';

import knex from '../db';
import { verifyJwt } from '../verfiyJwt';

import { client } from './plaid';

// 1. Exchange public Plaid token for private access token
// 2. Get the bank's institution information
// 3. Get the bank's accounts information

export default async function handler(request, response) {
  try {
    await verifyJwt(request);

    const PUBLIC_TOKEN = request.body.public_token;

    const tokenResponse = await client.itemPublicTokenExchange({
      public_token: PUBLIC_TOKEN
    });

    const ACCESS_TOKEN = tokenResponse.data.access_token;

    const itemRequest = await client.itemGet({
      access_token: ACCESS_TOKEN
    });
    const itemData = itemRequest.data;

    const institutionRequest = await client.institutionsGetById({
      institution_id: itemData.item.institution_id as string,
      country_codes: [CountryCode.Us, CountryCode.Ca],
      options: {
        include_optional_metadata: true
      }
    });
    const {
      institution_id,
      name: institution_name,
      primary_color,
      logo
    } = institutionRequest.data.institution;

    const dbTransaction = await knex.transaction();

    await knex('accounting.bank')
      .insert({
        id: institution_id,
        token: ACCESS_TOKEN,
        name: institution_name,
        primary_color,
        logo: logo || null,
        error: null
      })
      // On conflict, overwrite the existing record
      .onConflict('id')
      .merge()
      .transacting(dbTransaction);

    const accountsRequest = await client.accountsGet({
      access_token: ACCESS_TOKEN
    });
    const accounts = accountsRequest.data.accounts;

    await knex('accounting.account')
      .insert(
        accounts.map(account => ({
          id: account.account_id,
          name: account.name,
          bank_id: institution_id,
          currency: account.balances.iso_currency_code,
          balance: account.balances.current,
          description: `${account.official_name || ''} ${account.type}`
        }))
      )
      // On conflict, overwrite the existing record
      .onConflict('id')
      .merge()
      .transacting(dbTransaction);

    await dbTransaction.commit();

    response.json({
      itemData,
      accounts
    });
  } catch (error: any) {
    console.error({ error });

    response.status(500).json({ error: error.message });
  }
}
