'use server';

import db from '@/lib/db';
import { Tables } from '@/lib/knex/types';
import { handleActionError, validateRequired } from './utils';
import type { Invoice, InvoiceItem, ProjectTime } from '@/lib/knex/types';

export async function getInvoices(filters?: {
  limit?: number;
  offset?: number;
  order_by?: Array<{ column: string; order?: 'asc' | 'desc' }>;
  archived_at?: { _is_null: boolean };
  client_id?: number;
  contractor_id?: number;
}) {
  try {
    let query = db<Invoice>(Tables.invoice)
      .leftJoin('client', 'invoice.client_id', 'client.id')
      .leftJoin('project', 'client.id', 'project.client_id')
      .leftJoin('project_contractor', 'project.id', 'project_contractor.project_id')
      .leftJoin('contractor', 'project_contractor.contractor_id', 'contractor.id')
      .leftJoin('project_time', 'project.id', 'project_time.project_id')
      .select(
        'invoice.*',
        'client.name as client_name',
        db.raw('json_agg(DISTINCT jsonb_build_object(\'id\', contractor.id, \'first_name\', contractor.first_name)) FILTER (WHERE contractor.id IS NOT NULL) as contractors'),
        db.raw('json_agg(DISTINCT jsonb_build_object(\'start_time\', project_time.start_time, \'end_time\', project_time.end_time)) FILTER (WHERE project_time.id IS NOT NULL) as project_times')
      )
      .groupBy('invoice.id', 'client.id');

    if (filters?.archived_at?._is_null) {
      query = query.whereNull('invoice.archived_at');
    }

    if (filters?.client_id) {
      query = query.where('invoice.client_id', filters.client_id);
    }

    if (filters?.contractor_id) {
      query = query.where('invoice.contractor_id', filters.contractor_id);
    }

    if (filters?.order_by) {
      filters.order_by.forEach(({ column, order = 'asc' }) => {
        query = query.orderBy(`invoice.${column}`, order);
      });
    }

    const limit = filters?.limit ?? 10;
    const offset = filters?.offset ?? 0;

    const [data, totalResult] = await Promise.all([
      query.limit(limit).offset(offset),
      query.clone().clearSelect().clearOrder().clearGroup().count('* as count').first(),
    ]);

    const total = Number(totalResult?.count ?? 0);

    return { data, total, limit, offset };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function getInvoice(id: number) {
  try {
    const invoice = await db<Invoice>(Tables.invoice)
      .where({ id })
      .first();

    if (!invoice) {
      return { error: 'Invoice not found' };
    }

    // Get invoice items
    const items = await db<InvoiceItem>(Tables.invoiceItem)
      .where({ invoice_id: id })
      .whereNull('deleted_at');

    // Get project times
    const projectTimes = await db<ProjectTime>(Tables.projectTime)
      .where({ invoice_id: id })
      .whereNull('deleted_at');

    return {
      data: {
        ...invoice,
        invoice_items: items,
        project_times: projectTimes,
      },
    };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function createInvoice(data: {
  client_id?: number;
  contractor_id?: number;
  due_date?: Date;
}) {
  try {
    const [invoice] = await db<Invoice>(Tables.invoice)
      .insert({
        client_id: data.client_id,
        contractor_id: data.contractor_id,
        due_date: data.due_date,
      })
      .returning('*');

    return { data: invoice };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function updateInvoice(
  id: number,
  data: Partial<{
    due_date: Date;
    submitted_at: Date;
    paid_at: Date;
    archived_at: Date;
  }>
) {
  try {
    const [invoice] = await db<Invoice>(Tables.invoice)
      .where({ id })
      .update({
        ...data,
        updated_at: db.fn.now(),
      })
      .returning('*');

    if (!invoice) {
      return { error: 'Invoice not found' };
    }

    return { data: invoice };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function archiveInvoice(id: number) {
  try {
    await db<Invoice>(Tables.invoice)
      .where({ id })
      .update({ archived_at: db.fn.now() });

    return { success: true };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function createInvoiceItems(items: Array<{
  invoice_id: number;
  description?: string;
  currency: string;
  price: number;
  tax: number;
}>) {
  try {
    const createdItems = await db<InvoiceItem>(Tables.invoiceItem)
      .insert(items)
      .returning('*');

    return { data: createdItems };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function deleteInvoiceItems(itemIds: number[]) {
  try {
    await db<InvoiceItem>(Tables.invoiceItem)
      .whereIn('id', itemIds)
      .update({ deleted_at: db.fn.now() });

    return { success: true };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function addProjectTimesToInvoice(invoiceId: number, projectTimeIds: number[]) {
  try {
    await db<ProjectTime>(Tables.projectTime)
      .whereIn('id', projectTimeIds)
      .update({ invoice_id: invoiceId });

    return { success: true };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function removeProjectTimesFromInvoice(projectTimeIds: number[]) {
  try {
    await db<ProjectTime>(Tables.projectTime)
      .whereIn('id', projectTimeIds)
      .update({ invoice_id: null });

    return { success: true };
  } catch (error) {
    return handleActionError(error);
  }
}

