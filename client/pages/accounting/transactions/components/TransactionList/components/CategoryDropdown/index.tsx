import { useQuery } from '@apollo/client';

import { Dropdown } from 'primereact/dropdown';

import categoriesQuery from './categories.gql';

export default function CategoryDropdown({ value, onChange }) {
  const { data } = useQuery(categoriesQuery);

  const categories = data?.accounting_category;

  return (
    <Dropdown
      options={categories}
      optionLabel="name"
      optionValue="id"
      placeholder="Select a Category"
      filter
      showClear
      value={value}
      onChange={e => onChange(e.value)}
    />
  );
}
