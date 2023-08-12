import express from 'express';

import knex from './db.js';
import { graphApi } from './facebook.js';

const router = express.Router();

router.post('/importAccounts', async (req, res) => {
  try {
    const { getLinkedAdAccounts } = await graphApi(process.env.ADMIN_BM);

    const accounts = await getLinkedAdAccounts();

    await knex('ad_account').insert(accounts).onConflict('id').ignore();

    res.status(200).json(accounts);
  } catch (e) {
    console.log(e);
    res.status(500).json(e);
  }
});

router.post('/importSpend', async (req, res) => {
  try {
    const adAccounts = await knex('ad_account').select('id');

    const { getAdAccountInsights } = await graphApi(process.env.ADMIN_BM);

    const accountSpend = [];

    for (const { id } of adAccounts) {
      const insights = await getAdAccountInsights(id);

      for (const insight of insights) {
        const parsedInsight = {
          date_start: new Date(insight.date_start),
          date_stop: new Date(insight.date_stop),
          spend: parseFloat(insight.spend),
          ad_account_id: id,
        };

        // We only want final spend numbers
        if (parsedInsight.spend > 0 && parsedInsight.date_start && parsedInsight.date_stop) {
          accountSpend.push(parsedInsight);
        }
      }
    }

    await knex('ad_account_spend')
      .insert(accountSpend)
      .onConflict(['ad_account_id', 'spend', 'date_start', 'date_stop'])
      .ignore();

    res.status(200).json(accounts);
  } catch (e) {
    console.log(e);
    res.status(500).json(e);
  }
});

export default router;
