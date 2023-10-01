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
import updateCreditMutation from './queries/updateCredit.gql';
import updateDebitMutation from './queries/updateDebit.gql';

// gicType is either 'credit' or 'debit'
export default function GicModal({ gicType }) {
  const refetchQueries = gicType === 'credit' ? ['credits'] : ['debits'];

  const { gicTransactions, hasSelectedTransactions, resetSelectedTransactions } =
    useSelectedTransactions();

  const { transactions, type } = gicTransactions;

  const [updateCredit] = useMutation(updateCreditMutation, {
    refetchQueries
  });

  const [updateDebit] = useMutation(updateDebitMutation, {
    refetchQueries
  });

  const [gic, setGic] = useState<any>(null);

  return (
    <ModalVisible
      visible={hasSelectedTransactions()}
      header={`Categorize ${_.upperFirst(type)} Transaction`}
      onHide={() => resetSelectedTransactions()}
      footer={
        <Row>
          <Button
            type="button"
            label="Save"
            icon="pi pi-check"
            onClick={async () => {
              await updateTransactionGic();
              resetSelectedTransactions();
            }}
          />

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
      <Column>
        {transactions.map(transaction => (
          <div key={transaction.id}>
            {transaction.id} | {transaction.amount} | {transaction.description}
          </div>
        ))}
        <GicDropdown gic={gic} setGic={setGic} type={gicType} />
        <InputTextarea placeholder="Notes" />
      </Column>
    </ModalVisible>
  );

  function updateTransactionGic() {
    const updateTransaction = gicType === 'credit' ? updateCredit : updateDebit;

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

function GicDropdown({ gic, setGic, type }) {
  const { data } = useQuery(gicsQuery, {
    variables: {
      type
    },
    skip: _.isEmpty(type)
  });

  const gics = data?.accounting_gic;

  return (
    <Dropdown
      options={gics}
      optionLabel="name"
      placeholder="Select a GIC"
      value={gic}
      onChange={e => setGic(e.value)}
      data-cy="gic-dropdown"
    />
  );
}
