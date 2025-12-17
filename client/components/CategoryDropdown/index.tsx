'use client';

import { useEffect, useState } from 'react';
import { Dropdown } from 'primereact/dropdown';
import { getCategories } from '@/app/actions/accounting';

export default function CategoryDropdown({
  value,
  defaultCategory,
  isAccountBusiness = false,
  transactionType = null,
  isBusiness = null,
  showIcons = false,
  onChange
}: {
  value: any;
  defaultCategory?: string;
  isAccountBusiness?: boolean;
  transactionType?: string | null;
  isBusiness?: boolean | null;
  showIcons?: boolean;
  onChange: (value: any) => void;
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
          
          if (isBusiness !== null) {
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

  const _value =
    value ||
    categories?.find(
      category =>
        category.is_business === isAccountBusiness &&
        category.name.toLowerCase() === defaultCategory?.toLowerCase()
    )?.id;

  useEffect(() => {
    if (_value !== undefined) {
      onChange(_value);
    }
  }, [_value]);

  return (
    <Dropdown
      options={categories}
      optionLabel="name"
      optionValue="id"
      placeholder="Select a Category"
      filter
      showClear
      value={_value}
      onChange={e => onChange(e.value)}
      itemTemplate={showIcons ? categoryDropdownTemplate : undefined}
      valueTemplate={showIcons ? categoryDropdownValueTemplate : undefined}
    />
  );

  function categoryDropdownTemplate(option) {
    return (
      <div className="flex justify-content-start align-items-center gap-2">
        {isBusiness === null && (
          <i className={`pi ${option.is_business ? 'pi-briefcase' : 'pi-users'} p-mr-2`}></i>
        )}
        {!transactionType && (
          <i
            className={`pi ${
              option.transaction_type === 'debit' ? 'pi-arrow-down' : 'pi-arrow-up'
            } p-mr-4`}
            style={option.transaction_type === 'debit' ? { color: 'red' } : { color: 'green' }}
          />
        )}
        <span>{option.name}</span>
      </div>
    );
  }

  function categoryDropdownValueTemplate(option) {
    if (option) {
      return (
        <div className="flex justify-content-start align-items-center gap-2">
          {isBusiness === null && (
            <i className={`pi ${option.is_business ? 'pi-briefcase' : 'pi-users'} p-mr-2`}></i>
          )}
          {!transactionType && (
            <i
              className={`pi ${
                option.transaction_type === 'debit' ? 'pi-arrow-down' : 'pi-arrow-up'
              } p-mr-4`}
              style={option.transaction_type === 'debit' ? { color: 'red' } : { color: 'green' }}
            />
          )}
          <span>{option.name}</span>
        </div>
      );
    }
    return <span>Select a Category</span>;
  }
}
