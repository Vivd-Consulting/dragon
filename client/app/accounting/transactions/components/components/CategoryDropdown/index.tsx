'use client';

import { useEffect, useState } from 'react';
import { Dropdown } from 'primereact/dropdown';
import { getCategories } from '@/app/actions/accounting';

export default function CategoryDropdown({
  value,
  onChange,
  transactionType,
  isBusiness,
}: {
  value?: number;
  onChange: (value: number | undefined) => void;
  transactionType?: string;
  isBusiness?: boolean;
}) {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCategories() {
      try {
        const result = await getCategories();
        if ('data' in result) {
          let filtered = result.data || [];
          if (transactionType) {
            filtered = filtered.filter((c: any) => c.transaction_type === transactionType);
          }
          if (isBusiness !== undefined) {
            filtered = filtered.filter((c: any) => c.is_business === isBusiness);
          }
          setCategories(filtered);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    loadCategories();
  }, [transactionType, isBusiness]);

  return (
    <Dropdown
      options={categories}
      optionLabel="name"
      optionValue="id"
      placeholder="Select Category"
      filter
      showClear
      value={value}
      onChange={(e) => onChange(e.value)}
      disabled={loading}
    />
  );
}

