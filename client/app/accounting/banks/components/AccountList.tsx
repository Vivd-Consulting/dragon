'use client';

import { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputSwitch } from 'primereact/inputswitch';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { useRef } from 'react';

import { Row } from '@/components/Group';
import { getAccounts, updateAccount } from '@/app/actions/accounting';
import type { Account } from '@/lib/knex/types';

export default function AccountList({ bankId }: { bankId: string }) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');

  const toastRef = useRef<Toast>(null);

  useEffect(() => {
    if (bankId) {
      loadAccounts();
    }
  }, [bankId]);

  async function loadAccounts() {
    setLoading(true);
    try {
      const result = await getAccounts({ bank_id: bankId });
      if ('data' in result) {
        setAccounts(result.data || []);
      }
    } catch (error) {
      toastRef.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load accounts',
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  }

  async function toggleTracked(account: Account) {
    try {
      const result = await updateAccount(account.id, {
        excluded: !account.excluded,
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

      // Update local state
      setAccounts((prev) =>
        prev.map((a) => (a.id === account.id ? { ...a, excluded: !a.excluded } : a))
      );

      toastRef.current?.show({
        severity: 'success',
        summary: 'Success',
        detail: `Account ${!account.excluded ? 'excluded' : 'tracked'} successfully`,
        life: 2000,
      });
    } catch (error) {
      toastRef.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to update account',
        life: 3000,
      });
    }
  }

  async function toggleBusiness(account: Account) {
    try {
      const result = await updateAccount(account.id, {
        is_business: !account.is_business,
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

      // Update local state
      setAccounts((prev) =>
        prev.map((a) => (a.id === account.id ? { ...a, is_business: !a.is_business } : a))
      );
    } catch (error) {
      toastRef.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to update account',
        life: 3000,
      });
    }
  }

  function startEdit(account: Account) {
    setEditingId(account.id);
    setEditName(account.name);
    setEditDescription(account.description || '');
  }

  function cancelEdit() {
    setEditingId(null);
    setEditName('');
    setEditDescription('');
  }

  async function saveEdit(accountId: string) {
    try {
      const result = await updateAccount(accountId, {
        name: editName,
        description: editDescription || undefined,
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

      // Update local state
      setAccounts((prev) =>
        prev.map((a) =>
          a.id === accountId
            ? { ...a, name: editName, description: editDescription || null }
            : a
        )
      );

      cancelEdit();

      toastRef.current?.show({
        severity: 'success',
        summary: 'Success',
        detail: 'Account updated successfully',
        life: 2000,
      });
    } catch (error) {
      toastRef.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to update account',
        life: 3000,
      });
    }
  }

  return (
    <>
      <Toast ref={toastRef} />
      <DataTable
        value={accounts}
        emptyMessage="No accounts found for this bank."
        loading={loading}
        size="small"
      >
        <Column
          field="name"
          header="Account Name"
          body={(account: Account) => {
            if (editingId === account.id) {
              return (
                <InputText
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      saveEdit(account.id);
                    } else if (e.key === 'Escape') {
                      cancelEdit();
                    }
                  }}
                  autoFocus
                />
              );
            }
            return <span>{account.name}</span>;
          }}
        />
        <Column
          field="description"
          header="Description"
          body={(account: Account) => {
            if (editingId === account.id) {
              return (
                <InputText
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      saveEdit(account.id);
                    } else if (e.key === 'Escape') {
                      cancelEdit();
                    }
                  }}
                />
              );
            }
            return <span>{account.description || '-'}</span>;
          }}
        />
        <Column field="currency" header="Currency" />
        <Column
          field="balance"
          header="Balance"
          body={(account: Account) =>
            account.balance.toLocaleString('en-US', {
              style: 'currency',
              currency: account.currency,
            })
          }
        />
        <Column
          field="excluded"
          header="Tracked"
          body={(account: Account) => (
            <InputSwitch
              checked={!account.excluded}
              onChange={() => toggleTracked(account)}
              tooltip={account.excluded ? 'Not tracked' : 'Tracked'}
            />
          )}
        />
        <Column
          field="is_business"
          header="Business"
          body={(account: Account) => (
            <InputSwitch checked={account.is_business} onChange={() => toggleBusiness(account)} />
          )}
        />
        <Column
          header="Actions"
          body={(account: Account) => {
            if (editingId === account.id) {
              return (
                <Row gap="2">
                  <Button
                    icon="pi pi-check"
                    size="small"
                    severity="success"
                    onClick={() => saveEdit(account.id)}
                  />
                  <Button
                    icon="pi pi-times"
                    size="small"
                    severity="secondary"
                    onClick={cancelEdit}
                  />
                </Row>
              );
            }
            return (
              <Button
                icon="pi pi-pencil"
                size="small"
                onClick={() => startEdit(account)}
                tooltip="Edit"
              />
            );
          }}
        />
      </DataTable>
    </>
  );
}

