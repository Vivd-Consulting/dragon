import db from '../db';
import { Tables } from './types';

/**
 * Pagination helper for Knex queries
 */
export interface PaginationOptions {
  limit?: number;
  offset?: number;
}

export interface PaginationResult<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
}

/**
 * Execute a paginated query
 */
export async function paginate<T>(
  query: any,
  options: PaginationOptions = {}
): Promise<PaginationResult<T>> {
  const limit = options.limit ?? 10;
  const offset = options.offset ?? 0;

  const [data, totalResult] = await Promise.all([
    query.limit(limit).offset(offset),
    query.clone().clearSelect().clearOrder().count('* as count').first(),
  ]);

  const total = Number(totalResult?.count ?? 0);

  return {
    data,
    total,
    limit,
    offset,
  };
}

/**
 * Build a where clause from a filter object
 */
export function buildWhereClause(query: any, filters: Record<string, any>) {
  for (const [key, value] of Object.entries(filters)) {
    if (value === null || value === undefined) {
      continue;
    }

    if (Array.isArray(value)) {
      query.whereIn(key, value);
    } else if (typeof value === 'object' && value !== null) {
      // Handle operators like { _eq: value }, { _ilike: value }, etc.
      if ('_eq' in value) {
        query.where(key, value._eq);
      } else if ('_neq' in value) {
        query.whereNot(key, value._neq);
      } else if ('_gt' in value) {
        query.where(key, '>', value._gt);
      } else if ('_gte' in value) {
        query.where(key, '>=', value._gte);
      } else if ('_lt' in value) {
        query.where(key, '<', value._lt);
      } else if ('_lte' in value) {
        query.where(key, '<=', value._lte);
      } else if ('_ilike' in value) {
        query.whereILike(key, `%${value._ilike}%`);
      } else if ('_like' in value) {
        query.whereLike(key, `%${value._like}%`);
      } else if ('_is_null' in value) {
        if (value._is_null) {
          query.whereNull(key);
        } else {
          query.whereNotNull(key);
        }
      } else if ('_in' in value) {
        query.whereIn(key, value._in);
      } else if ('_or' in value) {
        query.where((builder: any) => {
          value._or.forEach((orCondition: any) => {
            builder.orWhere((subBuilder: any) => {
              Object.entries(orCondition).forEach(([orKey, orValue]) => {
                buildWhereClause(subBuilder, { [orKey]: orValue });
              });
            });
          });
        });
      }
    } else {
      query.where(key, value);
    }
  }
  return query;
}

/**
 * Build order by clause
 */
export function buildOrderBy(
  query: any,
  orderBy: Array<{ column: string; order?: 'asc' | 'desc' }> | string
) {
  if (typeof orderBy === 'string') {
    return query.orderBy(orderBy);
  }

  if (Array.isArray(orderBy)) {
    orderBy.forEach(({ column, order = 'asc' }) => {
      query.orderBy(column, order);
    });
  }

  return query;
}

/**
 * Soft delete helper
 */
export async function softDelete(table: string, id: number | string) {
  return db(table)
    .where({ id })
    .update({ deleted_at: db.fn.now() });
}

/**
 * Archive helper
 */
export async function archive(table: string, id: number | string) {
  return db(table)
    .where({ id })
    .update({ archived_at: db.fn.now() });
}

/**
 * Restore soft deleted record
 */
export async function restore(table: string, id: number | string) {
  return db(table)
    .where({ id })
    .update({ deleted_at: null });
}

/**
 * Restore archived record
 */
export async function unarchive(table: string, id: number | string) {
  return db(table)
    .where({ id })
    .update({ archived_at: null });
}

