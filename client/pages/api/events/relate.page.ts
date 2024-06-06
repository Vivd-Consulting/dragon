import { hasAdminToken } from '../token';

import { recommendRelatedTransactions } from './utils';

export const config = {
  maxDuration: 300
};

export default async function handler(request, response) {
  if (!hasAdminToken(request.headers['action-secret'] as string)) {
    response.status(401).json({ error: 'Unauthorized' });
    return;
  }

  try {
    const changedRows = await recommendRelatedTransactions();

    response.status(200).json({ changedRows });
  } catch (error) {
    console.log(error);
    response.status(500);
  }
}
