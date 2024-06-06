import express from 'express';

import { backfillTransactions, getCategories } from './plaid/plaid';
import knex from './db.js';

import { sendSlackMessage } from './slack/slack';

const router = express.Router();

router.post('/accounting/categories', async (req, res) => {
  try {
    const categories = await getCategories();

    res.status(200).json(categories);
  } catch (error) {
    console.log(error);
    res.status(500);
  }
});

router.post('/accounting/transactions', async (req, res) => {
  try {
    await backfillTransactions();

    await recommendRelatedTransactions();

    res.status(200).json({ success: true });
  } catch (error) {
    console.log(error);
    res.status(500);
  }
});

router.post('/accounting/relate', async (req, res) => {
  try {
    const changedRows = await recommendRelatedTransactions();

    res.status(200).json({ changedRows });
  } catch (error) {
    console.log(error);
    res.status(500);
  }
});

router.post('/accounting/transactions/alert', async (req, res) => {
  try {
    const { account_id, debit, currency, date } = req.body.data;

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

    res.status(200).json({ response });
  } catch (error) {
    console.log(error);
    res.status(500);
  }
});

async function recommendRelatedTransactions() {
  const insertedTransactions = await knex('accounting.transactions').select('*').where({
    related_transaction_id: null,
    gic_category_id: null
  });

  let changedRows: any[] = [];

  for (const transaction of insertedTransactions) {
    const recommended_relations = await lookForRelatedTransactions(transaction);

    const recomendations = recommended_relations.map(recommended_relation => ({
      transaction_id: transaction.id,
      recommended_transaction_id: recommended_relation.id
    }));

    if (recomendations.length > 0) {
      const changes = await knex('accounting.transactions_recommendations')
        .insert(recomendations)
        .onConflict(['transaction_id', 'recommended_transaction_id'])
        .ignore()
        .returning('*');

      changedRows = changedRows.concat(changes);
    }
  }

  return changedRows;
}

async function lookForRelatedTransactions(transaction) {
  let { debit, credit } = transaction;

  debit = Math.abs(debit);
  credit = Math.abs(credit);

  const relatedTransactions = await knex('accounting.transactions')
    .select('id')
    // find matching debits where debit is not null
    // or matching credits where credit is not null
    .where(function () {
      this.whereRaw('ABS(credit) = ABS(?)', debit).andWhereNot('credit', null);
    })
    .orWhere(function () {
      this.whereRaw('ABS(debit) = ABS(?)', credit).andWhereNot('debit', null);
    })
    .orderBy('date', 'desc');

  return relatedTransactions;
}

export default router;
