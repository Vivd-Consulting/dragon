import { useQuery } from '@apollo/client';

import { Dropdown } from 'primereact/dropdown';

import accountsQuery from './accounts.gql';

export default function AccountsDropdown({ value, onChange }) {
  const { data } = useQuery(accountsQuery);

  const accounts = data?.accounting_account;

  return (
    <Dropdown
      options={accounts}
      optionLabel="name"
      optionValue="id"
      placeholder="Select an Account"
      filter
      value={value}
      onChange={e => onChange(e.value)}
    />
  );
}
