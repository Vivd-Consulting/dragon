import _ from 'lodash';
import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { Button } from 'primereact/button';
import { InputTextarea } from 'primereact/inputtextarea';
import { DataTable } from 'primereact/datatable';
import { Column as PColumn } from 'primereact/column';

import { Column, Row } from 'components/Group';
import { ModalVisible } from 'components/Modal';

import transactionQuery from './queries/transaction.gql';
import updateTransfersMutation from './queries/updateTransfers.gql';

export default function TransferModal({ transferSourceId, setTransferSource }) {
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
        <Row>
          <Button
            type="button"
            label="Close"
            icon="pi pi-times"
            className="p-button-secondary"
            onClick={() => {
              setTransferSource(null);
            }}
          />
        </Row>
      }
    >
      {transferSource && <TransferModalForm transferSource={transferSource} />}
    </ModalVisible>
  );
}

function TransferModalForm({ transferSource }) {
  const [updateTransfers] = useMutation(updateTransfersMutation, {
    refetchQueries: ['transactions']
  });

  const recommendations = transferSource.recommendations.map(r => r.recommendation);

  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);

  return (
    <Column align="center" justify="center">
      <DataTable value={[transferSource]} tableStyle={{ minWidth: '50rem' }}>
        <PColumn field="id" header="ID" />
        <PColumn field="tid" header="TID" />
        <PColumn field="description" header="Description" />
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
        <PColumn field="date" header="Date" />
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
        <PColumn field="id" header="ID" />
        <PColumn field="tid" header="TID" />
        <PColumn field="description" header="Description" />
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
        <PColumn field="date" header="Date" />
      </DataTable>

      <InputTextarea placeholder="Notes" className="w-full" />
    </Column>
  );
}
