'use client';

import { useEffect, useState } from 'react';
import { Dropdown } from 'primereact/dropdown';
import { getAccounts } from '@/app/actions/accounting';

export default function AccountsDropdown({
  value,
  onChange,
}: {
  value?: string;
  onChange: (value: string | undefined) => void;
}) {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAccounts() {
      try {
        const result = await getAccounts();
        if ('data' in result) {
          setAccounts(result.data || []);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    loadAccounts();
  }, []);

  return (
    <Dropdown
      options={accounts}
      optionLabel="name"
      optionValue="id"
      placeholder="Select Account"
      filter
      showClear
      value={value}
      onChange={(e) => onChange(e.value)}
      disabled={loading}
    />
  );
}

