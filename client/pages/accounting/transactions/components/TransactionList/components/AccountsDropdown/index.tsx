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
      itemTemplate={accountDropdownTemplate}
      valueTemplate={accountDropdownValueTemplate}
      filter
      showClear
      value={value}
      onChange={e => onChange(e.value)}
    />
  );

  function accountDropdownTemplate(option) {
    return (
      <div className="flex justify-content-start align-items-center gap-2">
        <i className={`pi ${option.is_business ? 'pi-briefcase' : 'pi-users'} p-mr-4`}></i>
        <span>{option.name}</span>
      </div>
    );
  }

  function accountDropdownValueTemplate(option) {
    if (option) {
      return (
        <div className="flex justify-content-start align-items-center gap-2">
          <i className={`pi ${option.is_business ? 'pi-briefcase' : 'pi-users'} p-mr-2`}></i>
          <span>{option.name}</span>
        </div>
      );
    }
    return <span>Select an Account</span>;
  }
}
