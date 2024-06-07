import _ from 'lodash';
import { useEffect, useState } from 'react';
import { useKeyPress } from 'ahooks';
import useSWR from 'swr';
import { useQuery, useMutation } from '@apollo/client';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Checkbox } from 'primereact/checkbox';

import { Column, Row } from 'components/Group';
import { ModalVisible } from 'components/Modal';

import { useAuth } from 'hooks/useAuth';

import useSelectedTransactions from '../../hooks/useSelectedTransactions';

import categoriesQuery from './queries/categories.gql';
import taxesQuery from './queries/taxes.gql';
import updateTransactionMutation from './queries/updateTransaction.gql';
import createRuleMutation from './queries/createRule.gql';
import accountsQuery from './queries/accounts.gql';

const fetcher = ([url, token]) => {
  if (!token) {
    return Promise.reject('No token provided');
  }

  return fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    }
  }).then(res => res.json());
};

export default function CategoryModal({ refetchTransactions }) {
  const { token } = useAuth();

  const { mutate: applyRulesMutation } = useSWR(
    ['/api/events/transactions/apply-rules', token],
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false
    }
  );

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

  const hasManyTransactions = transactions.length > 1;
  const transaction = transactions[0];

  const [category, setCategory] = useState<any>(null);
  const [notes, setNotes] = useState<string>('');
  const [tax, setTax] = useState<number>();
  const [accountId, setAccountId] = useState<number>();
  const [makeRule, setMakeRule] = useState<boolean>(false);

  const [ruleName, setRuleName] = useState<string>();
  const [transactionRegex, setTransactionRegex] = useState<string>();

  useEffect(() => {
    if (hasManyTransactions) {
      setRuleName('');
      setTransactionRegex('%%');
      setTax(undefined);
      setAccountId(undefined);
    } else {
      setRuleName(transaction?.name);
      setTransactionRegex(`%${transaction?.name}%`);
      setTax(transaction?.tax_id);
      setAccountId(transaction?.account_id);
    }
  }, [hasManyTransactions, transaction]);

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
          <ul>
            {transactions.map(transaction => (
              <li key={transaction.id}>{transaction.name}</li>
            ))}
          </ul>
          <CategoryDropdown
            category={category}
            setCategory={setCategory}
            transactionType={type}
            categoryType={categoryType}
          />
          <AccountDropdown accountId={accountId} setAccountId={setAccountId} />
          <TaxDropdown tax={tax} setTax={setTax} />
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
      await applyRules();
    }
  }

  function updateTransactionCategory() {
    return updateTransaction({
      variables: {
        category: category?.id,
        transactionType: type,
        notes,
        tax,
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
        rule_type: categoryType.toUpperCase(),
        tax_id: tax
      }
    });
  }

  async function applyRules() {
    await applyRulesMutation();

    refetchTransactions();
  }

  function resetFields() {
    setCategory(null);
    setNotes('');
    setMakeRule(false);
    setRuleName('');
    setTransactionRegex('');
    setTax(undefined);
    setAccountId(undefined);
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

function TaxDropdown({ tax, setTax }) {
  const { data } = useQuery(taxesQuery);

  return (
    <Dropdown
      options={data?.accounting_tax}
      optionLabel="name"
      optionValue="id"
      placeholder="Select a Tax"
      value={tax}
      onChange={e => setTax(e.value)}
      showClear
      data-cy="tax-dropdown"
    />
  );
}

function AccountDropdown({ accountId, setAccountId }) {
  const { data } = useQuery(accountsQuery);

  const accounts = data?.accounting_account;

  return (
    <Dropdown
      options={accounts}
      optionLabel="name"
      optionValue="id"
      placeholder="Select an Account"
      value={accountId}
      onChange={e => setAccountId(e.value)}
      showClear
      data-cy="account-dropdown"
    />
  );
}
