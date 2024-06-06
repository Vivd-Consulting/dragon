import { getCategories } from '../plaid/plaid';
import { hasAdminToken } from '../token';

export default async function handler(request, response) {
  if (!hasAdminToken(request.headers['action-secret'] as string)) {
    response.status(401).json({ error: 'Unauthorized' });
    return;
  }

  try {
    const categories = await getCategories();

    response.status(200).json(categories);
  } catch (error) {
    console.log(error);
    response.status(500);
  }
}
