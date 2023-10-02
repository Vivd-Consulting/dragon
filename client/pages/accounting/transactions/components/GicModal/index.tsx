import _ from 'lodash';
import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { InputTextarea } from 'primereact/inputtextarea';

import { Column, Row } from 'components/Group';
import { ModalVisible } from 'components/Modal';

import useSelectedTransactions from '../../hooks/useSelectedTransactions';

import gicsQuery from './queries/gics.gql';
import updateTransactionMutation from './queries/updateTransaction.gql';

// gicType is either 'credit' or 'debit'
export default function GicModal() {
  const { gicTransactions, hasSelectedTransactions, resetSelectedTransactions } =
    useSelectedTransactions();

  const { transactions, type } = gicTransactions;

  // We should only ever get one type of transaction at a time in an array, but make sure ALL are the same type
  const hasMixedDebitAndCredits =
    _.uniq(transactions.map(transaction => transaction.debit > 0)).length > 1;

  const gicType = transactions?.[0]?.debit > 0 ? 'debit' : 'credit';

  const [updateTransaction] = useMutation(updateTransactionMutation, {
    refetchQueries: ['transactions']
  });

  const [gic, setGic] = useState<any>(null);

  return (
    <ModalVisible
      visible={hasSelectedTransactions()}
      header={`Categorize ${_.upperFirst(type)} ${_.upperFirst(gicType)}`}
      onHide={() => resetSelectedTransactions()}
      footer={
        <Row>
          {!hasMixedDebitAndCredits && (
            <Button
              type="button"
              label="Save"
              icon="pi pi-check"
              onClick={async () => {
                await updateTransactionGic();
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
              {transaction.id} | {transaction.amount} | {transaction.description}
            </div>
          ))}
          <GicDropdown gic={gic} setGic={setGic} transactionType={type} gicType={gicType} />
          <InputTextarea placeholder="Notes" />
        </Column>
      )}
    </ModalVisible>
  );

  function updateTransactionGic() {
    return updateTransaction({
      variables: {
        gic: gic?.id,
        transactionType: type,
        notes: '',
        transactionIds: transactions.map(transaction => transaction.id)
      }
    });
  }
}

function GicDropdown({ gic, setGic, gicType, transactionType }) {
  const { data } = useQuery(gicsQuery, {
    variables: {
      type: gicType,
      is_business: transactionType === 'business'
    },
    skip: _.isEmpty(gicType)
  });

  const gics = data?.accounting_gic;

  return (
    <Dropdown
      options={gics}
      optionLabel="name"
      placeholder="Select a Category"
      value={gic}
      onChange={e => setGic(e.value)}
      data-cy="gic-dropdown"
      filter
    />
  );
}
