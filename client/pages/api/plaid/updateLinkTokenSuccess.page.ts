import knex from '../db';

// import { client } from './plaid';
import { verifyJwt } from './verfiyJwt';

export default async function handler(request, response) {
  try {
    await verifyJwt(request);

    const { oldToken, newToken } = request.body;

    // Find the matching bank account in the database, and remove the error status
    await knex('bank').update({ error: null, token: newToken }).where({ token: oldToken });

    response.json({ success: true });
  } catch (error: any) {
    console.error({ error });

    response.status(500).json({ error: error.message });
  }
}
