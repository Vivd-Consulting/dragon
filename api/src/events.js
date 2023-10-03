import express from 'express';

import { backfill } from './accounting/cibc.js';

import knex from './accounting/db.js';

const router = express.Router();

// Import transactions from the CIBC database
router.post('/accounting/cibc', async (req, res) => {
  const { fromDate, toDate } = req.body;
  const insertedTransactions = await backfill({ fromDate, toDate });

  await recommendRelatedTransactions();

  res.status(200).json(insertedTransactions);
});

router.get('/accounting/relate', async (req, res) => {
  const changedRows = await recommendRelatedTransactions();

  res.status(200).json({ changedRows })
})

async function recommendRelatedTransactions() {
  const insertedTransactions = await knex('accounting.transactions').select('*');

  let changedRows = [];

  for (const transaction of insertedTransactions) {
    const recommended_relations = await lookForRelatedTransactions(transaction);

    const recomendations = recommended_relations.map((recommended_relation) => ({
      transaction_id: transaction.id,
      recommended_transaction_id: recommended_relation.id,
    }));

    if (recomendations.length > 0) {
      const changes = await knex('accounting.transactions_recommendations')
        .insert(recomendations )
        .onConflict(['transaction_id', 'recommended_transaction_id']).ignore()
        .returning('*');

        changedRows = changedRows.concat(changes);
    }
  }

  return changedRows;
}

async function lookForRelatedTransactions(transaction) {
  const { debit, credit } = transaction;

  const relatedTransactions = await knex('accounting.transactions')
    .select('id')
    // find matching debits where debit is not null
    // or matching credits where credit is not null
    .where(function () {
      this.where('credit', debit).andWhereNot('credit', null);
    })
    .orWhere(function () {
      this.where('debit', credit).andWhereNot('debit', null);
    })
    .orderBy('date', 'desc');

  return relatedTransactions;
}

export default router;
