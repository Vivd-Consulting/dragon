'use server';

import db from '@/lib/db';
import { Tables } from '@/lib/knex/types';
import { handleActionError } from './utils';
import type { Bank } from '@/lib/knex/types';

export async function getBanks(filters?: {
  limit?: number;
  offset?: number;
  order_by?: Array<{ column: string; order?: 'asc' | 'desc' }>;
}) {
  try {
    let query = db<Bank>('accounting.bank');

    if (filters?.order_by) {
      filters.order_by.forEach(({ column, order = 'asc' }) => {
        query = query.orderBy(column, order);
      });
    }

    const limit = filters?.limit ?? 10;
    const offset = filters?.offset ?? 0;

    const [data, totalResult] = await Promise.all([
      query.limit(limit).offset(offset),
      query.clone().clearSelect().clearOrder().count('* as count').first(),
    ]);

    const total = Number((totalResult as any)?.count ?? 0);

    return { data, total, limit, offset };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function createBank(data: {
  id: string;
  name: string;
  token?: string;
  primary_color?: string;
  logo?: string;
  cursor?: string;
}) {
  try {
    const [bank] = await db<Bank>('accounting.bank')
      .insert({
        id: data.id,
        name: data.name,
        token: data.token,
        primary_color: data.primary_color,
        logo: data.logo,
        cursor: data.cursor,
      })
      .returning('*');

    return { data: bank };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function updateBank(
  id: string,
  data: Partial<{
    name: string;
    token: string;
    primary_color: string;
    logo: string;
    cursor: string;
    error: string;
  }>
) {
  try {
    const [bank] = await db<Bank>('accounting.bank')
      .where({ id })
      .update({
        ...data,
        updated_at: db.fn.now(),
      })
      .returning('*');

    if (!bank) {
      return { error: 'Bank not found' };
    }

    return { data: bank };
  } catch (error) {
    return handleActionError(error);
  }
}

