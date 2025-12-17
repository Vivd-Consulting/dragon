'use server';

import db from '@/lib/db';
import { Tables } from '@/lib/knex/types';

export async function applyRules() {
  try {
    const rules = await db('accounting.rules').whereNull('deleted_at');

    for (const rule of rules) {
      const query = db('accounting.transactions')
        .update({
          gic_category_id: rule.gic_id,
          applied_rule: rule.id,
          tax_id: rule.tax_id,
        })
        .whereNull('gic_category_id')
        .whereILike('name', rule.transaction_regex);

      await query;
    }

    return { success: true };
  } catch (error: any) {
    console.error(error);
    return { error: error.message };
  }
}

