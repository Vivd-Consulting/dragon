import { Products } from 'plaid';

import { verifyJwt } from '../verfiyJwt';

import { client } from './plaid';

const PLAID_PRODUCTS = (process.env.PLAID_PRODUCTS || Products.Transactions).split(',');
const PLAID_COUNTRY_CODES = (process.env.PLAID_COUNTRY_CODES || 'US,CA').split(',');
const PLAID_REDIRECT_URI = process.env.PLAID_REDIRECT_URI || '';

export default async function handler(request, response) {
  try {
    const decodedJwt = await verifyJwt(request);
    const hasuraClaims = decodedJwt['https://hasura.io/jwt/claims'];
    const userId = hasuraClaims['x-hasura-user-id'];

    const configs: any = {
      user: {
        client_user_id: userId
      },
      client_name: 'Dragon',
      products: PLAID_PRODUCTS,
      country_codes: PLAID_COUNTRY_CODES,
      language: 'en',
      account_filters: {
        depository: { account_subtypes: ['checking', 'savings'] },
        credit: { account_subtypes: ['credit card'] }
      }
    };

    if (PLAID_REDIRECT_URI !== '') {
      configs.redirect_uri = PLAID_REDIRECT_URI;
    }

    const createTokenResponse = await client.linkTokenCreate(configs);
    const tokenData = createTokenResponse.data;

    response.json(tokenData);
  } catch (error: any) {
    console.error({ error });

    response.status(500).json({ error: error.message });
  }
}
