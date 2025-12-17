'use server';

const WISE_API_TOKEN = process.env.WISE_API_TOKEN;
const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;
const PROFILE_ID = process.env.WISE_PROFILE_ID;

async function getBorderlessAccounts() {
  if (!WISE_API_TOKEN || !PROFILE_ID) {
    throw new Error('Wise API credentials not configured');
  }

  const res = await fetch(
    `https://api.transferwise.com/v3/profiles/${PROFILE_ID}/borderless-accounts`,
    {
      headers: { Authorization: `Bearer ${WISE_API_TOKEN}` },
    }
  );
  const data = await res.json();

  return data[0];
}

async function getTransactions(accountId: string) {
  if (!WISE_API_TOKEN || !PROFILE_ID) {
    throw new Error('Wise API credentials not configured');
  }

  const res = await fetch(
    `https://api.transferwise.com/v3/profiles/${PROFILE_ID}/borderless-accounts/${accountId}/transactions`,
    {
      headers: { Authorization: `Bearer ${WISE_API_TOKEN}` },
    }
  );

  return await res.json();
}

async function postToSlack(msg: string) {
  if (!SLACK_WEBHOOK_URL) {
    return;
  }

  await fetch(SLACK_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: msg }),
  });
}

export async function checkWise() {
  try {
    const account = await getBorderlessAccounts();
    const txns = await getTransactions(account.id);

    if (!txns || txns.length === 0) {
      return { data: { message: 'No new transactions' } };
    }

    const latest = txns[0];
    const isCredit = latest.type === 'CREDIT';
    const msg = `${isCredit ? '💰' : '💸'} *${isCredit ? 'Credit' : 'Debit'}*: ${
      latest.amount.value
    } ${latest.amount.currency}
Description: ${latest.details.description || 'N/A'}`;

    await postToSlack(msg);

    return { data: { message: 'Wise check completed', transaction: latest } };
  } catch (error: any) {
    console.error('Error checking Wise:', error);
    return { error: error.message };
  }
}

