'use server';

import db from '@/lib/db';
import { Tables } from '@/lib/knex/types';
import { handleActionError } from './utils';
import type { Project } from '@/lib/knex/types';

// Minimal Server Actions for invoices only - no CRUD operations
export async function getProjects(filters?: {
  client_id?: number;
  archived_at?: { _is_null: boolean };
}) {
  try {
    let query = db<Project>(Tables.project);

    if (filters?.client_id) {
      query = query.where('client_id', filters.client_id);
    }

    if (filters?.archived_at?._is_null) {
      query = query.whereNull('archived_at');
    }

    const projects = await query.orderBy('name', 'asc');

    return { data: projects };
  } catch (error) {
    return handleActionError(error);
  }
}
