import { WebClient } from '@slack/web-api';

// Read a token from the environment variables
const token = process.env.SLACK_TOKEN;
const slack = new WebClient(token);

const channel = '#accounting';

export async function sendSlackMessage({ account, amount, currency, accountCurrency, date }) {
  const currencyMismatch = accountCurrency !== currency;

  const result = await slack.chat.postMessage({
    channel,
    text: `
      ${amount} ${currency} was spent on ${account} - ${date}
      ${currencyMismatch ? `*Currency mismatch* - account currency is ${accountCurrency}` : ''}
    `
  });

  return result;
}
