import { hasAdminToken } from '../../token';
import { verifyJwt } from '../../verfiyJwt';

import knex from '../../db';

export const config = {
  maxDuration: 300
};

export default async function handler(request, response) {
  const decodedJwt = await verifyJwt(request);
  const hasuraClaims = decodedJwt['https://hasura.io/jwt/claims'];
  const userId = hasuraClaims['x-hasura-user-id'];

  if (!userId && !hasAdminToken(request.headers['action-secret'] as string)) {
    response.status(401).json({ error: 'Unauthorized' });
    return;
  }

  try {
    const rules = await knex('accounting.rules');

    for (const rule of rules) {
      await knex('accounting.transactions')
        .where({ gic_category_id: null })
        .andWhere('name', 'ILIKE', rule.transactionRegex)
        .update({ gic_category_id: rule.gic_id });
    }

    response.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    response.status(500);
  }
}
