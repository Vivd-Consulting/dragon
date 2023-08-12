const base = "https://graph.facebook.com/v17.0";

import knex from './db.js';

export async function graphApi(bmId) {
  const { token } = await knex('facebook_token').where('bm_id', bmId).first();

  return {
    getLinkedAdAccounts: () => getLinkedAdAccounts(bmId, token),
    getMe: () => getMe(token),
    getAdAccountInsights: (adAccountId) => getAdAccountInsights(adAccountId, token),
  }
}

async function getLinkedAdAccounts(bmId, token) {
  const request = await fetch(`${base}/${bmId}/client_ad_accounts?fields=name&access_token=${token}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const { data } = await request.json();

  return data;
}

async function getAdAccountInsights(adAccountId, token) {
  const request = await fetch(`${base}/${adAccountId}/insights?fields=account_name,account_id,spend&access_token=${token}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const { data } = await request.json();

  return data;
}

function getMe(token) {
  const request = fetch(`${base}/me?fields=name&access_token=${token}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const response = request.json();

  return response;
}
