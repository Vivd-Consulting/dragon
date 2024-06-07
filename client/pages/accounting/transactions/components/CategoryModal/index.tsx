import _ from 'lodash';
import { useEffect, useState } from 'react';
import { useKeyPress } from 'ahooks';
import { useQuery, useMutation } from '@apollo/client';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Checkbox } from 'primereact/checkbox';

import { Column, Row } from 'components/Group';
import { ModalVisible } from 'components/Modal';

import useSelectedTransactions from '../../hooks/useSelectedTransactions';

import categoriesQuery from './queries/categories.gql';
import updateTransactionMutation from './queries/updateTransaction.gql';
import createRuleMutation from './queries/createRule.gql';

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

  const [createRule] = useMutation(createRuleMutation, {
    refetchQueries: ['rules']
  });

  const [category, setCategory] = useState<any>(null);
  const [notes, setNotes] = useState<string>('');
  const [makeRule, setMakeRule] = useState<boolean>(false);

  const hasManyTransactions = transactions.length > 1;
  const transaction = transactions[0];

  const [ruleName, setRuleName] = useState<string>();
  const [transactionRegex, setTransactionRegex] = useState<string>();

  useEffect(() => {
    if (hasManyTransactions) {
      setRuleName('');
      setTransactionRegex('%%');
    } else {
      setRuleName(transaction?.name);
      setTransactionRegex(`%${transaction?.name}%`);
    }
  }, [hasManyTransactions, transaction]);

  useKeyPress(['meta.delete'], submit);

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
              disabled={!category}
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
          <div className="flex align-items-center mb-1">
            <Checkbox
              inputId="rule"
              name="rule"
              onChange={(e: any) => setMakeRule(e.checked)}
              checked={makeRule}
            />
            <label htmlFor="rule" className="ml-2">
              Make Rule
            </label>
          </div>
          {makeRule && (
            <>
              <div className="flex flex-column gap-1">
                <label htmlFor="ruleName" className="ml-2">
                  Rule Name
                </label>
                <InputText
                  name="ruleName"
                  placeholder="Rule Name"
                  disabled={!makeRule}
                  value={ruleName}
                  onChange={e => setRuleName(e.target.value)}
                />
              </div>
              <div className="flex flex-column gap-1">
                <label htmlFor="transactionRegex" className="ml-2">
                  Transaction Regex
                </label>
                <InputText
                  name="transactionRegex"
                  placeholder="Transaction Regex"
                  disabled={!makeRule}
                  value={transactionRegex}
                  onChange={e => setTransactionRegex(e.target.value)}
                />
              </div>
            </>
          )}
        </Column>
      )}
    </ModalVisible>
  );

  async function submit() {
    await updateTransactionCategory();
    resetSelectedTransactions();
    resetFields();

    if (makeRule && ruleName && transactionRegex && category) {
      await _createRule();
    }
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

  function _createRule() {
    return createRule({
      variables: {
        name: ruleName,
        account_id: transaction.account_id,
        gic_id: category.id,
        transaction_regex: transactionRegex,
        rule_type: categoryType.toUpperCase()
      }
    });
  }

  function resetFields() {
    setCategory(null);
    setNotes('');
    setMakeRule(false);
    setRuleName('');
    setTransactionRegex('');
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
