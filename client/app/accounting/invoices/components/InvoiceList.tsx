'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { confirmDialog } from 'primereact/confirmdialog';
import { Toast } from 'primereact/toast';
import { Badge } from 'primereact/badge';

import { Row } from '@/components/Group';
import { getInvoices, archiveInvoice } from '@/app/actions/invoices';
import calculateTotalTimeAndCost from '@/utils/calculateTotalTimeAndCost';

export default function InvoiceList() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalRecords, setTotalRecords] = useState(0);
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(10);

  const toastRef = useRef<Toast>(null);
  const router = useRouter();

  useEffect(() => {
    loadInvoices();
  }, [first, rows]);

  async function loadInvoices() {
    setLoading(true);
    try {
      const result = await getInvoices({
        limit: rows,
        offset: first,
        archived_at: { _is_null: true },
      });

      if ('error' in result) {
        toastRef.current?.show({
          severity: 'error',
          summary: 'Error',
          detail: result.error,
          life: 3000,
        });
        return;
      }

      setInvoices(result.data || []);
      setTotalRecords(result.total || 0);
    } catch (error) {
      toastRef.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load invoices',
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  }

  const onPage = (event: any) => {
    setFirst(event.first);
    setRows(event.rows);
  };

  const confirmArchiveInvoice = (data: any) => {
    confirmDialog({
      message: 'Are you sure you want to archive this invoice?',
      header: 'Archive Invoice',
      icon: 'pi pi-exclamation-triangle',
      accept: () => _archiveInvoice(data),
    });
  };

  async function _archiveInvoice(data: any) {
    try {
      const result = await archiveInvoice(data.id);

      if ('error' in result) {
        toastRef.current?.show({
          life: 3000,
          severity: 'error',
          summary: 'Failed to archive invoice.',
          detail: result.error,
        });
        return;
      }

      toastRef.current?.show({
        severity: 'success',
        summary: 'Success',
        detail: 'Invoice is archived!',
        life: 3000,
      });

      loadInvoices();
    } catch (e) {
      toastRef.current?.show({
        life: 3000,
        severity: 'error',
        summary: 'Failed to archive invoice.',
        detail: 'Unable to archive the invoice at this time.',
      });
      console.error(e);
    }
  }

  function useActionButtons(data: any) {
    return (
      <Row>
        <Button
          size="small"
          tooltip="View"
          tooltipOptions={{ position: 'top' }}
          icon="pi pi-eye"
        />
        <Button
          size="small"
          icon="pi pi-user-edit"
          tooltip="Edit"
          tooltipOptions={{ position: 'top' }}
          onClick={() => router.push(`/accounting/invoices/${data.id}/edit`)}
        />
        <Button
          size="small"
          tooltip="Archive"
          tooltipOptions={{ position: 'top' }}
          severity="danger"
          icon="pi pi-trash"
          onClick={() => confirmArchiveInvoice(data)}
        />
      </Row>
    );
  }

  return (
    <>
      <Toast ref={toastRef} />

      <DataTable
        value={invoices}
        paginator
        lazy
        onPage={onPage}
        first={first}
        rows={rows}
        totalRecords={totalRecords}
        removableSort
        responsiveLayout="scroll"
        paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
        currentPageReportTemplate="Showing {first} to {last} of {totalRecords}"
        rowsPerPageOptions={[10, 25, 50, 100]}
        emptyMessage="No invoices found."
        data-cy="invoices-table"
        loading={loading}
      >
        <Column field="id" header="ID" sortable />
        <Column field="client_name" header="Client Name" />
        <Column
          body={({ submitted_at, paid_at }: any) => {
            let status = { value: 'Draft', severity: 'warning' as const };

            if (submitted_at) {
              status = { value: 'Submitted', severity: 'warning' as const };
            }

            if (paid_at) {
              status = { value: 'Paid', severity: 'warning' as const };
            }

            return <Badge value={status.value} severity={status.severity} />;
          }}
          header="Status"
        />
        <Column body={useActionButtons} />
      </DataTable>
    </>
  );
}

