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
      data-cy="category-dropdown"
      itemTemplate={categoryDropdownTemplate}
      valueTemplate={categoryDropdownValueTemplate}
      filter
      showClear
      value={value}
      onChange={e => onChange(e.value)}
    />
  );

  function categoryDropdownTemplate(option) {
    return (
      <div className="flex justify-content-start align-items-center gap-2">
        <i className={`pi ${option.is_business ? 'pi-briefcase' : 'pi-users'} p-mr-4`}></i>
        <span>{option.name}</span>
      </div>
    );
  }

  function categoryDropdownValueTemplate(option) {
    if (option) {
      return (
        <div className="flex justify-content-start align-items-center gap-2">
          <i className={`pi ${option.is_business ? 'pi-briefcase' : 'pi-users'} p-mr-2`}></i>
          <span>{option.name}</span>
        </div>
      );
    }
    return <span>Select a Category</span>;
  }
}
