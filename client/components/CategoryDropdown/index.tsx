import { useQuery } from '@apollo/client';

import { Dropdown } from 'primereact/dropdown';

import categoriesQuery from './categories.gql';

export default function CategoryDropdown({
  value,
  defaultCategory,
  transactionType = null,
  isBusiness = null,
  showIcons = false,
  onChange
}: {
  value: any;
  defaultCategory?: string;
  transactionType?: string | null;
  isBusiness?: boolean | null;
  showIcons?: boolean;
  onChange: (value: any) => void;
}) {
  const where: any = {};

  if (transactionType) {
    where.transaction_type = { _eq: transactionType };
  }

  if (isBusiness !== null) {
    where.is_business = { _eq: isBusiness };
  }

  const { data } = useQuery(categoriesQuery, {
    variables: {
      where
    }
  });

  const categories = data?.accounting_category;

  return (
    <Dropdown
      options={categories}
      optionLabel="name"
      optionValue="id"
      placeholder="Select a Category"
      filter
      showClear
      value={
        value ||
        categories?.find(category => category.name.toLowerCase() === defaultCategory?.toLowerCase())
          ?.id
      }
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
