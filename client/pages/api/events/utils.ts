import knex from '../db';

export async function recommendRelatedTransactions() {
  const insertedTransactions = await knex('accounting.transactions').select('*').where({
    related_transaction_id: null,
    gic_category_id: null
  });

  let changedRows: any[] = [];

  for (const transaction of insertedTransactions) {
    const recommended_relations = await lookForRelatedTransactions(transaction);

    const recomendations = recommended_relations.map(recommended_relation => ({
      transaction_id: transaction.id,
      account_id: transaction.account_id,
      recommended_transaction_id: recommended_relation.id,
      recommended_account_id: recommended_relation.account_id
    }));

    if (recomendations.length > 0) {
      const changes = await knex('accounting.transactions_recommendations')
        .insert(recomendations)
        .onConflict([
          'transaction_id',
          'account_id',
          'recommended_transaction_id',
          'recommended_account_id'
        ])
        .ignore()
        .returning('*');

      changedRows = changedRows.concat(changes);
    }
  }

  return changedRows;
}

export async function lookForRelatedTransactions(transaction) {
  let { debit, credit } = transaction;

  debit = Math.abs(debit);
  credit = Math.abs(credit);

  const relatedTransactions = await knex('accounting.transactions')
    .select('id', 'account_id')
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
