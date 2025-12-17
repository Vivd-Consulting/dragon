'use server';

import { WebClient } from '@slack/web-api';

const token = process.env.SLACK_TOKEN;
const slack = token ? new WebClient(token) : null;

const channel = '#accounting';

export async function sendSlackMessage({
  account,
  amount,
  currency,
  accountCurrency,
  date,
}: {
  account: string;
  amount: number;
  currency: string;
  accountCurrency: string;
  date: string;
}) {
  if (!slack) {
    return { error: 'Slack token not configured' };
  }

  try {
    const currencyMismatch = accountCurrency !== currency;

    const result = await slack.chat.postMessage({
      channel,
      text: `
      ${amount} ${currency} was spent on ${account} - ${date}
      ${currencyMismatch ? `*Currency mismatch* - account currency is ${accountCurrency}` : ''}
    `,
    });

    return { data: result };
  } catch (error: any) {
    console.error({ error });
    return { error: error.message };
  }
}

