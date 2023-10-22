import _ from 'lodash';
import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { InputTextarea } from 'primereact/inputtextarea';

import { Column, Row } from 'components/Group';
import { ModalVisible } from 'components/Modal';

import useSelectedTransactions from '../../hooks/useSelectedTransactions';

import categoriesQuery from './queries/categories.gql';
import updateTransactionMutation from './queries/updateTransaction.gql';

// categoryType is either 'credit' or 'debit'
export default function CategoryModal() {
  const { categoryTransactions, hasSelectedTransactions, resetSelectedTransactions } =
    useSelectedTransactions();

  const { transactions, type } = categoryTransactions;

  // We should only ever get one type of transaction at a time in an array, but make sure ALL are the same type
  const hasMixedDebitAndCredits =
    _.uniq(transactions.map(transaction => transaction.debit > 0)).length > 1;

  const categoryType = transactions?.[0]?.debit > 0 ? 'debit' : 'credit';

  const [updateTransaction] = useMutation(updateTransactionMutation, {
    refetchQueries: ['transactions']
  });

  const [category, setCategory] = useState<any>(null);
  const [notes, setNotes] = useState<string>('');

  return (
    <ModalVisible
      visible={hasSelectedTransactions()}
      header={`Categorize ${_.upperFirst(type)} ${_.upperFirst(categoryType)}`}
      onHide={() => resetSelectedTransactions()}
      footer={
        <Row>
          {!hasMixedDebitAndCredits && (
            <Button
              type="button"
              label="Save"
              icon="pi pi-check"
              onClick={async () => {
                await updateTransactionCategory();
                resetSelectedTransactions();
              }}
            />
          )}

          <Button
            type="button"
            label="Close"
            icon="pi pi-times"
            className="p-button-secondary"
            onClick={() => {
              resetSelectedTransactions();
            }}
          />
        </Row>
      }
    >
      {hasMixedDebitAndCredits ? (
        <span>Can only bulk set 1 type of transaction at a time</span>
      ) : (
        <Column>
          {transactions.map(transaction => (
            <div key={transaction.id}>
              {transaction.id} | {transaction.amount} | {transaction.name}
            </div>
          ))}
          <CategoryDropdown
            category={category}
            setCategory={setCategory}
            transactionType={type}
            categoryType={categoryType}
          />
          <InputTextarea
            placeholder="Notes"
            value={notes}
            onChange={e => setNotes(e.target.value)}
          />
        </Column>
      )}
    </ModalVisible>
  );

  function updateTransactionCategory() {
    return updateTransaction({
      variables: {
        category: category?.id,
        transactionType: type,
        notes,
        transactionIds: transactions.map(transaction => transaction.id)
      }
    });
  }
}

function CategoryDropdown({ category, setCategory, categoryType, transactionType }) {
  const { data } = useQuery(categoriesQuery, {
    variables: {
      type: categoryType,
      is_business: transactionType === 'business'
    },
    skip: _.isEmpty(categoryType)
  });

  const categories = data?.accounting_category;

  return (
    <Dropdown
      options={categories}
      optionLabel="name"
      placeholder="Select a Category"
      value={category}
      onChange={e => setCategory(e.value)}
      data-cy="category-dropdown"
      filter
    />
  );
}
