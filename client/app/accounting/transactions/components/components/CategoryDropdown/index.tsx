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
          
          // Debug: log filtering criteria
          console.log('CategoryDropdown filtering:', {
            transactionType,
            isBusiness,
            totalCategories: filtered.length,
          });
          
          if (transactionType) {
            filtered = filtered.filter((c: any) => {
              const categoryType = c.transaction_type?.toLowerCase();
              const filterType = transactionType.toLowerCase();
              return categoryType === filterType;
            });
            console.log(`After transactionType filter (${transactionType}):`, filtered.length);
          }
          
          if (isBusiness !== undefined) {
            filtered = filtered.filter((c: any) => c.is_business === isBusiness);
            console.log(`After isBusiness filter (${isBusiness}):`, filtered.length);
          }
          
          console.log('Final filtered categories:', filtered.length);
          setCategories(filtered);
        }
      } catch (error) {
        console.error('Error loading categories:', error);
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

