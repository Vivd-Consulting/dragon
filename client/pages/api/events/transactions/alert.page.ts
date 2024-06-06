import { hasAdminToken } from '../../token';
import { sendSlackMessage } from '../../slack/slack';
import knex from '../../db';

export default async function handler(request, _response) {
  if (!hasAdminToken(request.headers.action_secret as string)) {
    _response.status(401).json({ error: 'Unauthorized' });
    return;
  }

  try {
    const { account_id, debit, currency, date } = request.body.data;

    const accountQuery = await knex('accounting.account')
      .select('name', 'currency')
      .where({
        id: account_id
      })
      .first();

    const response = await sendSlackMessage({
      account: accountQuery.name,
      amount: debit,
      currency,
      accountCurrency: accountQuery.currency,
      date
    });

    _response.status(200).json({ response });
  } catch (error) {
    console.log(error);
    _response.status(500);
  }
}
