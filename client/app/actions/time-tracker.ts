'use server';

import db from '@/lib/db';
import { Tables } from '@/lib/knex/types';
import { handleActionError } from './utils';
import type { ProjectTime } from '@/lib/knex/types';

// Minimal Server Actions for invoices only - no CRUD operations
export async function getProjectTimes(filters?: {
  project_id?: number;
  invoice_id?: { _is_null: boolean };
}) {
  try {
    let query = db<ProjectTime>(Tables.projectTime)
      .whereNull('deleted_at');

    if (filters?.project_id) {
      query = query.where('project_id', filters.project_id);
    }

    if (filters?.invoice_id?._is_null) {
      query = query.whereNull('invoice_id');
    }

    const projectTimes = await query.orderBy('start_time', 'desc');

    return { data: projectTimes };
  } catch (error) {
    return handleActionError(error);
  }
}
