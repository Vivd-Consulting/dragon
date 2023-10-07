import { Configuration, PlaidApi, Products, PlaidEnvironments } from 'plaid';

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

export default async function handler(request, response) {
  const PUBLIC_TOKEN = request.body.public_token;

  const tokenResponse = await client.itemPublicTokenExchange({
    public_token: PUBLIC_TOKEN
  });

  // eslint-disable-next-line no-console
  console.log({
    tokenResponse
  });

  // Insert the bank and token into the DB

  const ACCESS_TOKEN = tokenResponse.data.access_token;
  const ITEM_ID = tokenResponse.data.item_id;

  response.json({
    // the 'access_token' is a private token, DO NOT pass this token to the frontend in your production environment
    access_token: ACCESS_TOKEN,
    item_id: ITEM_ID,
    error: null
  });
}
