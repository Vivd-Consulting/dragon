'use server';

import db from '@/lib/db';
import { Tables } from '@/lib/knex/types';
import { handleActionError, validateRequired } from './utils';
import type {
  Transaction,
  Rule,
  Tax,
  Account,
  Bank,
  Gic,
} from '@/lib/knex/types';

export async function getTransactions(filters?: {
  limit?: number;
  offset?: number;
  order_by?: Array<{ column: string; order?: 'asc' | 'desc' }>;
  where?: {
    deleted_at?: { _is_null: boolean };
    account_id?: string | number;
    gic_id?: { _is_null: boolean } | number | string;
    date_gte?: Date;
    date_lte?: Date;
    debit_gt?: number;
    credit_gt?: number;
  };
}) {
  try {
    let query = db<Transaction>('accounting.transactions')
      .leftJoin('accounting.account', 'accounting.transactions.account_id', 'accounting.account.id')
      .leftJoin('accounting.category', 'accounting.transactions.gic_category_id', 'accounting.category.id')
      .leftJoin('accounting.rules', 'accounting.transactions.applied_rule', 'accounting.rules.id')
      .select(
        'accounting.transactions.*',
        'accounting.account.name as account_name',
        'accounting.category.name as category_name',
        'accounting.category.is_business as category_is_business',
        'accounting.rules.name as applied_rule_name'
      );

    if (filters?.where?.deleted_at?._is_null) {
      query = query.whereNull('accounting.transactions.deleted_at');
    }

    if (filters?.where?.account_id) {
      query = query.where('accounting.transactions.account_id', filters.where.account_id);
    }

    if (filters?.where?.gic_id) {
      if (typeof filters.where.gic_id === 'object' && filters.where.gic_id._is_null) {
        query = query.whereNull('accounting.transactions.gic_category_id');
      } else {
        query = query.where('accounting.transactions.gic_category_id', filters.where.gic_id);
      }
    }

    if (filters?.where?.date_gte) {
      query = query.where('accounting.transactions.date', '>=', filters.where.date_gte);
    }

    if (filters?.where?.date_lte) {
      query = query.where('accounting.transactions.date', '<=', filters.where.date_lte);
    }

    if (filters?.where?.debit_gt !== undefined) {
      query = query.where('accounting.transactions.debit', '>', filters.where.debit_gt);
    }

    if (filters?.where?.credit_gt !== undefined) {
      query = query.where('accounting.transactions.credit', '>', filters.where.credit_gt);
    }

    if (filters?.order_by) {
      filters.order_by.forEach(({ column, order = 'asc' }) => {
        query = query.orderBy(`accounting.transactions.${column}`, order);
      });
    } else {
      query = query.orderBy('accounting.transactions.date', 'desc');
    }

    const limit = filters?.limit ?? 10;
    const offset = filters?.offset ?? 0;

    const [data, totalResult] = await Promise.all([
      query.limit(limit).offset(offset),
      query.clone().clearSelect().clearOrder().count('* as count').first(),
    ]);

    const total = Number(totalResult?.count ?? 0);

    // Transform data to match expected format
    const transformedData = data.map((t: any) => ({
      ...t,
      account: { name: t.account_name },
      gicCategory: t.category_name
        ? { name: t.category_name, is_business: t.category_is_business }
        : null,
      appliedRule: t.applied_rule_name ? { name: t.applied_rule_name } : null,
    }));

    return { data: transformedData, total, limit, offset };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function getTransaction(id: number) {
  try {
    const transaction = await db<Transaction>('accounting.transactions')
      .where({ id })
      .first();

    if (!transaction) {
      return { error: 'Transaction not found' };
    }

    return { data: transaction };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function updateTransaction(
  id: number,
  data: Partial<{
    gic_category_id?: number;
    gic_id?: number;
    notes?: string;
    applied_rule?: number;
    tax_id?: number;
  }>
) {
  try {
    const updateData: any = {
      updated_at: db.fn.now(),
    };

    if (data.gic_category_id !== undefined) {
      updateData.gic_category_id = data.gic_category_id;
    } else if (data.gic_id !== undefined) {
      updateData.gic_category_id = data.gic_id;
    }

    if (data.notes !== undefined) {
      updateData.notes = data.notes;
    }

    if (data.applied_rule !== undefined) {
      updateData.applied_rule = data.applied_rule;
    }

    if (data.tax_id !== undefined) {
      updateData.tax_id = data.tax_id;
    }

    const [transaction] = await db<Transaction>('accounting.transactions')
      .where({ id })
      .update(updateData)
      .returning('*');

    if (!transaction) {
      return { error: 'Transaction not found' };
    }

    return { data: transaction };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function getRules() {
  try {
    const rules = await db<Rule>('accounting.rules').whereNull('deleted_at');
    return { data: rules };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function getRule(id: number) {
  try {
    const rule = await db<Rule>('accounting.rules').where({ id }).first();
    if (!rule) {
      return { error: 'Rule not found' };
    }
    return { data: rule };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function createRule(data: {
  name: string;
  transaction_regex: string;
  rule_type: 'CREDIT' | 'DEBIT';
  gic_id?: number;
  tax_id?: number;
}) {
  try {
    validateRequired(data, ['name', 'transaction_regex', 'rule_type']);

    const [rule] = await db<Rule>('accounting.rules')
      .insert(data)
      .returning('*');

    return { data: rule };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function updateRule(
  id: number,
  data: Partial<{
    name: string;
    transaction_regex: string;
    rule_type: 'CREDIT' | 'DEBIT';
    gic_id: number;
    tax_id: number;
  }>
) {
  try {
    const [rule] = await db<Rule>('accounting.rules')
      .where({ id })
      .update({
        ...data,
        updated_at: db.fn.now(),
      })
      .returning('*');

    if (!rule) {
      return { error: 'Rule not found' };
    }

    return { data: rule };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function deleteRule(id: number) {
  try {
    await db<Rule>('accounting.rules')
      .where({ id })
      .update({ deleted_at: db.fn.now() });

    return { success: true };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function getAccounts() {
  try {
    const accounts = await db<Account>('accounting.account');
    return { data: accounts };
  } catch (error) {
    return handleActionError(error);
  }
}


export async function getCategories() {
  try {
    const categories = await db<Gic>('accounting.category');
    return { data: categories };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function getTaxes() {
  try {
    const taxes = await db<Tax>('accounting.tax');
    return { data: taxes };
  } catch (error) {
    return handleActionError(error);
  }
}

