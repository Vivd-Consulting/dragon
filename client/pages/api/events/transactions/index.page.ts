import { hasAdminToken } from '../../token';
import { backfillTransactions } from '../../plaid/plaid';

import { recommendRelatedTransactions } from '../utils';

export default async function handler(request, response) {
  console.log({ headers: request.headers });
  if (!hasAdminToken(request.headers['action-secret'] as string)) {
    response.status(401).json({ error: 'Unauthorized' });
    return;
  }

  try {
    await backfillTransactions();

    await recommendRelatedTransactions();

    response.status(200).json({ success: true });
  } catch (error) {
    console.log(error);
    response.status(500);
  }
}
