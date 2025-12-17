'use server';

import db from '@/lib/db';
import { Tables } from '@/lib/knex/types';
import { handleActionError } from './utils';
import type { Client } from '@/lib/knex/types';

// Minimal Server Actions for invoices only - no CRUD operations
export async function getClients(filters?: {
  archived_at?: { _is_null: boolean };
}) {
  try {
    let query = db<Client>(Tables.client);

    if (filters?.archived_at?._is_null) {
      query = query.whereNull('archived_at');
    }

    const clients = await query.orderBy('name', 'asc');

    return { data: clients };
  } catch (error) {
    return handleActionError(error);
  }
}
