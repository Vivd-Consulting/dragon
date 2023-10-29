import _ from 'lodash';
import { useState } from 'react';
import { useKeyPress } from 'ahooks';
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

  useKeyPress(['meta.enter'], submit);

  return (
    <ModalVisible
      visible={hasSelectedTransactions()}
      header={`Categorize ${_.upperFirst(type)} ${_.upperFirst(categoryType)}`}
      onHide={() => resetSelectedTransactions()}
      style={{ width: '50vw' }}
      footer={
        <Row justify="end">
          {!hasMixedDebitAndCredits && (
            <Button
              type="button"
              label="Save"
              icon="pi pi-check"
              severity={type === 'personal' ? 'success' : undefined}
              onClick={submit}
            />
          )}

          <Button
            type="button"
            label="Close"
            icon="pi pi-times"
            className="p-button-secondary"
            onClick={() => {
              resetSelectedTransactions();
              resetFields();
            }}
          />
        </Row>
      }
    >
      {hasMixedDebitAndCredits ? (
        <span>Can only bulk set 1 type of transaction at a time</span>
      ) : (
        <Column>
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

  async function submit() {
    await updateTransactionCategory();
    resetSelectedTransactions();
    resetFields();
  }

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

  function resetFields() {
    setCategory(null);
    setNotes('');
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

  return (
    <Dropdown
      options={data?.accounting_category}
      optionLabel="name"
      placeholder="Select a Category"
      value={category}
      onChange={e => setCategory(e.value)}
      data-cy="category-dropdown"
      filter
      filterInputAutoFocus
      autoFocus
    />
  );
}
