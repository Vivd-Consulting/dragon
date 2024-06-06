import { hasAdminToken } from '../../token';
import { backfillTransactions } from '../../plaid/plaid';

import { recommendRelatedTransactions } from '../utils';

export default async function handler(request, response) {
  if (!hasAdminToken(request.headers.action_secret as string)) {
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
