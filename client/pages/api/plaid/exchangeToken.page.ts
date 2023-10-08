import { client } from './plaid';
import { verifyJwt } from './verfiyJwt';

// import knex from '../db';

export default async function handler(request, response) {
  try {
    const decodedJwt = await verifyJwt(request);
    const PUBLIC_TOKEN = request.body.public_token;

    const tokenResponse = await client.itemPublicTokenExchange({
      public_token: PUBLIC_TOKEN
    });

    // eslint-disable-next-line no-console
    console.log({
      tokenResponse
    });

    const ACCESS_TOKEN = tokenResponse.data.access_token;
    const ITEM_ID = tokenResponse.data.item_id;

    // Insert the bank and token into the DB
    // knex('bank').insert({ });

    response.json({
      // the 'access_token' is a private token, DO NOT pass this token to the frontend in your production environment
      // access_token: ACCESS_TOKEN,
      item_id: ITEM_ID,
      error: null
    });
  } catch (error: any) {
    console.error({ error });

    response.status(500).json({ error: error.message });
  }
}
