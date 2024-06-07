import _ from 'lodash';
import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { Button } from 'primereact/button';
import { InputTextarea } from 'primereact/inputtextarea';
import { DataTable } from 'primereact/datatable';
import { Column as PColumn } from 'primereact/column';

import { useCategories } from 'hooks/useCategories';

import { Column, Row } from 'components/Group';
import { ModalVisible } from 'components/Modal';

import transactionQuery from './queries/transaction.gql';
import updateTransfersMutation from './queries/updateTransfers.gql';

export default function TransferModal({ transferSourceId, setTransferSource }) {
  const [, getBy] = useCategories();

  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [notes, setNotes] = useState<string | null>(null);

  const [updateTransfers] = useMutation(updateTransfersMutation, {
    refetchQueries: ['transactions']
  });

  const { data } = useQuery(transactionQuery, {
    variables: {
      id: transferSourceId
    },
    skip: !transferSourceId
  });

  const transferSource = data?.accounting_transactions_by_pk;

  return (
    <ModalVisible
      visible={!!data}
      header="Associate transfer"
      onHide={() => setTransferSource(null)}
      footer={
        <Row justify="end">
          <Button
            type="button"
            label="Close"
            icon="pi pi-times"
            className="p-button-secondary"
            onClick={() => {
              setTransferSource(null);
            }}
          />
          <Button
            type="button"
            label="Save"
            icon="pi pi-check"
            disabled={!selectedTransaction}
            onClick={onSubmit}
          />
        </Row>
      }
    >
      {transferSource && (
        <TransferModalForm
          transferSource={transferSource}
          notes={notes}
          setNotes={setNotes}
          selectedTransaction={selectedTransaction}
          setSelectedTransaction={setSelectedTransaction}
        />
      )}
    </ModalVisible>
  );

  function onSubmit() {
    return updateTransfers({
      variables: {
        sourceGic: getBy({ name: 'Transfer' }).id,
        matchedGic: getBy({ name: 'Transfer' }).id,
        notes,
        sourceTransfer: transferSourceId,
        matchedTransfer: selectedTransaction.id
      }
    }).then(() => setTransferSource(null));
  }
}

function TransferModalForm({
  transferSource,
  notes,
  setNotes,
  selectedTransaction,
  setSelectedTransaction
}) {
  const recommendations = transferSource.recommendations.map(r => r.recommendation);

  return (
    <Column align="center" justify="center">
      <DataTable value={[transferSource]} tableStyle={{ minWidth: '50rem' }}>
        <PColumn field="account.name" header="Account" />
        <PColumn field="name" header="Description" />
        <PColumn
          field="amount"
          header="Amount"
          body={({ debit, credit }) => {
            const isDebit = debit > 0;
            const value = isDebit ? -Math.abs(debit) : Math.abs(credit);
            const color = isDebit ? 'text-red-500' : 'text-green-500';

            return (
              <span className={color}>
                {value.toLocaleString('en-US', {
                  style: 'currency',
                  currency: 'USD'
                })}
              </span>
            );
          }}
        />
        <PColumn
          field="date"
          header="Date"
          body={({ date }) => (
            <span>
              {new Date(date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}
            </span>
          )}
        />
      </DataTable>

      <i className="pi pi-arrow-down pt-4"></i>

      <DataTable
        selectionMode="radiobutton"
        selection={selectedTransaction}
        onSelectionChange={e => setSelectedTransaction(e.value)}
        dataKey="id"
        value={recommendations}
        tableStyle={{ minWidth: '50rem' }}
      >
        <PColumn selectionMode="single" headerStyle={{ width: '3rem' }} />
        <PColumn field="account.name" header="Account" />
        <PColumn field="name" header="Description" />
        <PColumn
          field="amount"
          header="Amount"
          body={({ debit, credit }) => {
            const isDebit = debit > 0;
            const value = isDebit ? -Math.abs(debit) : Math.abs(credit);
            const color = isDebit ? 'text-red-500' : 'text-green-500';

            return (
              <span className={color}>
                {value.toLocaleString('en-US', {
                  style: 'currency',
                  currency: 'USD'
                })}
              </span>
            );
          }}
        />
        <PColumn field="gicCategory.name" header="Category" />
        <PColumn
          field="date"
          header="Date"
          body={({ date }) => (
            <span>
              {new Date(date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}
            </span>
          )}
        />
      </DataTable>

      <InputTextarea
        value={notes}
        onChange={e => setNotes(e.target.value)}
        placeholder="Notes"
        className="w-full"
      />
    </Column>
  );
}
