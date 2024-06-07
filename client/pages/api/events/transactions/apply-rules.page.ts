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
    const rules = await knex('accounting.rules').where({ deleted_at: null });

    for (const rule of rules) {
      const query = knex('accounting.transactions')
        .update({ gic_category_id: rule.gic_id, applied_rule: rule.id, tax_id: rule.tax_id })
        .where({ gic_category_id: null })
        .where('name', 'ILIKE', rule.transaction_regex);

      if (rule.account_id) {
        query.where({ account_id: rule.account_id });
      }

      await query;
    }

    response.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    response.status(500);
  }
}
