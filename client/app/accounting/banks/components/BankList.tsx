'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Toast } from 'primereact/toast';

import { dateFormat } from '@/utils';
import { UpdatePlaidLink } from '@/components/PlaidLink';
import { getBanks } from '@/app/actions/banks';
import AccountList from './AccountList';
import type { Bank } from '@/lib/knex/types';

export default function BankList() {
  const [banks, setBanks] = useState<Bank[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalRecords, setTotalRecords] = useState(0);
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(10);
  const [sortField, setSortField] = useState<string | undefined>();
  const [sortOrder, setSortOrder] = useState<0 | 1 | -1 | null | undefined>();
  const [expandedRows, setExpandedRows] = useState<any>(null);

  const toastRef = useRef<Toast>(null);

  useEffect(() => {
    loadBanks();
  }, [first, rows, sortField, sortOrder]);

  async function loadBanks() {
    setLoading(true);
    try {
      const result = await getBanks({
        limit: rows,
        offset: first,
        order_by: sortField ? [{ column: sortField, order: (sortOrder === 1 ? 'asc' : 'desc') as 'asc' | 'desc' }] : undefined,
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

      setBanks(result.data || []);
      setTotalRecords(result.total || 0);
    } catch (error) {
      toastRef.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load banks',
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  }

  const onPage = (event: any) => {
    setFirst(event.first);
    setRows(event.rows);
    if (event.sortField) {
      setSortField(event.sortField);
      setSortOrder(event.sortOrder);
    }
  };

  function onSuccessLink() {
    loadBanks();
  }

  function onFailLink() {
    // Handle failure
  }

  const rowExpansionTemplate = (bank: Bank) => {
    return (
      <div className="p-3">
        <AccountList bankId={bank.id} />
      </div>
    );
  };

  return (
    <>
      <Toast ref={toastRef} />

      <DataTable
        value={banks}
        paginator
        lazy
        onPage={onPage}
        first={first}
        rows={rows}
        onSort={onPage}
        sortField={sortField}
        sortOrder={sortOrder}
        totalRecords={totalRecords}
        removableSort
        responsiveLayout="scroll"
        paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
        currentPageReportTemplate="Showing {first} to {last} of {totalRecords}"
        rowsPerPageOptions={[10, 25, 50, 100]}
        emptyMessage="No Banks found."
        data-cy="banks-table"
        loading={loading}
        expandedRows={expandedRows}
        onRowToggle={(e) => {
          setExpandedRows(e.data);
        }}
        rowExpansionTemplate={rowExpansionTemplate}
        dataKey="id"
      >
        <Column expander style={{ width: '3rem' }} />
        <Column field="id" header="ID" sortable />
        <Column
          field="logo"
          body={({ name, logo, primary_color }: Bank) => {
            return logo ? (
              <Image
                src={`data:image/png;base64,${logo}`}
                alt={name}
                height={30}
                width={30}
                style={{ borderRadius: 15 }}
              />
            ) : (
              <div
                style={{ backgroundColor: primary_color || '#ccc', height: 30, width: 30, borderRadius: 15 }}
              />
            );
          }}
        />
        <Column field="name" header="Name" />
        <Column
          body={({ created_at }: Bank) => <span>{dateFormat(created_at)}</span>}
          field="created_at"
          header="Created At"
        />
        <Column
          body={({ updated_at }: Bank) => <span>{dateFormat(updated_at)}</span>}
          field="updated_at"
          header="Updated At"
        />
        <Column
          body={({ error }: Bank) =>
            error ? <span className="text-red-500">{error}</span> : <i className="pi pi-check"></i>
          }
          field="error"
          header="Errors"
        />
        <Column
          header="Actions"
          body={({ token }: Bank) => (
            <UpdatePlaidLink oldToken={token || ''} onSuccess={onSuccessLink} onFail={onFailLink} />
          )}
        />
      </DataTable>
    </>
  );
}

