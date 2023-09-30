import knex from './db.js';

export async function backfill({ fromDate, toDate, accountId }) {
  // TODO: Get from DB query
  // const accounts = await knex('account').select('id', 'name');

  return getTransactions({ fromDate, toDate, accountId });
}

async function fetchTransactions({
  accountId,
  fromDate,
  toDate,
  limit = 150,
  offset = 0
}) {
  const request = fetch(
    `https://www.cibconline.cibc.com/ebm-ai/api/v1/json/transactions?accountId=${accountId}&filterBy=range&fromDate=${fromDate}&interaction=noSelection&lastFilterBy=range&limit=${limit}&lowerLimitAmount=&offset=${
      offset * limit
    }&sortAsc=true&sortByField=date&toDate=${toDate}&transactionLocation=&transactionType=&upperLimitAmount=`,
    {
      headers: await headers(),
      referrer:
        'https://www.cibconline.cibc.com/ebm-resources/public/banking/cibc/client/web/index.html',
      referrerPolicy: 'strict-origin-when-cross-origin',
      body: null,
      method: 'GET',
      mode: 'cors',
      credentials: 'include'
    }
  );

  return request.then((r) => r.json());
}

async function collectTransactions({ accountId, fromDate, toDate }) {
  let { transactions, meta } = await fetchTransactions({
    accountId,
    fromDate,
    toDate,
    offset: 0
  });

  let allTransactions = [];
  if (Array.isArray(transactions)) {
    allTransactions = [...transactions];
  } else {
    return [];
  }

  let offset = 0;
  while (meta.hasNext) {
    offset += 1;

    const t = await fetchTransactions({ accountId, fromDate, toDate, offset });
    allTransactions = allTransactions.concat(t.transactions);

    meta = t.meta;
  }

  return allTransactions;
}

export async function getTransactions({ fromDate, toDate, accountId }) {
  const transactions = await collectTransactions({
    accountId,
    fromDate,
    toDate
  });

  const result = {};

  // Using result[accountId] || [] ensures that an array is always present for accountId
  result[accountId] = result[accountId] || [];

  // Using push directly, no need for an if-else block
  result[accountId].push(...transactions);

  return result;
}

async function headers() {
  const { token } =  await knex('bank').select('token').where({ name: 'cibc' }).first();
  const _auth = JSON.parse(token);
  const cookie = _auth.cookie;
  const xAuthToken = _auth['x-auth-token'];

  return {
    accept: 'application/vnd.api+json',
    'accept-language': 'en',
    brand: 'cibc',
    'client-type': 'default_web',
    'content-type': 'application/vnd.api+json',
    'sec-ch-ua':
      '"Not?A_Brand";v="8", "Chromium";v="108", "Google Chrome";v="108"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"macOS"',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-origin',
    'www-authenticate': 'CardAndPassword',
    cookie,
    'x-auth-token': xAuthToken,
    'x-device-id': '59251893169217231341591999576720098967',
    'x-requested-with': 'XMLHttpRequest'
  };
}
