'use server';

import { Products } from 'plaid';
import { Configuration, PlaidApi, PlaidEnvironments, Products as PlaidProducts } from 'plaid';

const PLAID_CLIENT_ID = process.env.PLAID_CLIENT_ID;
const PLAID_SECRET = process.env.PLAID_SECRET;
const PLAID_ENV = process.env.PLAID_ENV || 'sandbox';

const configuration = new Configuration({
  basePath: PlaidEnvironments[PLAID_ENV as keyof typeof PlaidEnvironments],
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': PLAID_CLIENT_ID,
      'PLAID-SECRET': PLAID_SECRET,
    },
  },
});

const client = new PlaidApi(configuration);

const PLAID_PRODUCTS = (process.env.PLAID_PRODUCTS || PlaidProducts.Transactions).split(',');
const PLAID_COUNTRY_CODES = (process.env.PLAID_COUNTRY_CODES || 'US,CA').split(',');
const PLAID_REDIRECT_URI = process.env.PLAID_REDIRECT_URI || '';

export async function createLinkToken(userId?: string) {
  try {
    const configs: any = {
      user: {
        client_user_id: userId || 'default',
      },
      client_name: 'Dragon',
      products: PLAID_PRODUCTS as any,
      country_codes: PLAID_COUNTRY_CODES as any,
      language: 'en',
      account_filters: {
        depository: { account_subtypes: ['checking', 'savings'] },
        credit: { account_subtypes: ['credit card'] },
      },
    };

    if (PLAID_REDIRECT_URI !== '') {
      configs.redirect_uri = PLAID_REDIRECT_URI;
    }

    const createTokenResponse = await client.linkTokenCreate(configs);
    return { data: createTokenResponse.data };
  } catch (error: any) {
    console.error({ error });
    return { error: error.message };
  }
}

export async function exchangeToken(publicToken: string) {
  try {
    const response = await client.itemPublicTokenExchange({
      public_token: publicToken,
    });
    return { data: response.data };
  } catch (error: any) {
    console.error({ error });
    return { error: error.message };
  }
}

