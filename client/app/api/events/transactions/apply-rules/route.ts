import { NextRequest, NextResponse } from 'next/server';
import knex from '../../../db';

export const maxDuration = 300;

export async function POST(request: NextRequest) {
  // Authentication removed - this endpoint is now public
  // If you need authentication, add it back here

  try {
    const rules = await knex('accounting.rules').where({ deleted_at: null });

    for (const rule of rules) {
      const query = knex('accounting.transactions')
        .update({ gic_category_id: rule.gic_id, applied_rule: rule.id, tax_id: rule.tax_id })
        .where({ gic_category_id: null })
        .where('name', 'ILIKE', rule.transaction_regex);

      if (rule.account_id) {
        query.where({ account_id: rule.account_id });
      }

      await query;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

