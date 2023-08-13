import { useState } from 'react';
import cx from 'clsx';
import { useMutation } from '@apollo/client';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tooltip } from 'primereact/tooltip';
import { Button } from 'primereact/button';
import { InputTextarea } from 'primereact/inputtextarea';
import { ConfirmPopup, confirmPopup } from 'primereact/confirmpopup';

import { Row } from 'components/Group';
import { ModalVisible } from 'components/Modal';

import { usePaginatedQuery } from 'hooks/usePaginatedQuery';

import wireQuery from './queries/clients.gql';
import denyWireMutation from './denyWire.gql';
import approveWireMutation from './approveWire.gql';

export default function ClientList() {
  const {
    query: { loading, error, previousData, data },
    paginationValues,
    onPage
  } = usePaginatedQuery(wireQuery, {
    fetchPolicy: 'no-cache'
  });

  const [denyWire] = useMutation(denyWireMutation, {
    refetchQueries: ['wires']
  });
  const [approveWire] = useMutation(approveWireMutation, {
    refetchQueries: ['wires']
  });

  const [denyThis, setDenyThis] = useState<any>();
  const [deniedReason, setDenyReason] = useState<any>();

  if (error) {
    return null;
  }

  const wireRequests = loading ? previousData?.wire_request : data?.wire_request;
  const totalRecords = loading
    ? previousData?.wire_request_aggregate.aggregate.count
    : data?.wire_request_aggregate.aggregate.count;

  return (
    <>
      <ConfirmPopup />
      <ModalVisible
        header="Deny Wire"
        visible={!!denyThis}
        footer={
          <Row align="flex-end" fullWidth>
            <Button
              label="Deny"
              severity="danger"
              onClick={async () => {
                await denyWire({
                  variables: {
                    id: denyThis,
                    deniedReason
                  }
                });

                setDenyThis(null);
                setDenyReason(null);
              }}
            />
            <Button
              label="Cancel"
              security="secondary"
              onClick={() => setDenyThis(null)}
              outlined
            />
          </Row>
        }
      >
        <InputTextarea
          rows={5}
          cols={30}
          autoResize
          placeholder="Why are we rejecting this wire?"
          onChange={e => setDenyReason(e.target.value)}
        />
      </ModalVisible>
      <DataTable
        value={wireRequests}
        paginator
        lazy
        onPage={onPage}
        first={paginationValues.first}
        rows={paginationValues.rows}
        onSort={onPage}
        sortField={paginationValues.sortField}
        sortOrder={paginationValues.sortOrder}
        totalRecords={totalRecords}
        removableSort
        responsiveLayout="scroll"
        paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
        currentPageReportTemplate="Showing {first} to {last} of {totalRecords}"
        rowsPerPageOptions={[10, 25, 50, 100]}
        emptyMessage="No Wires found."
        data-cy="wires-table"
      >
        <Column field="id" header="ID" sortable />
        <Column
          field="amount"
          header="Amount"
          body={({ amount }) => {
            return (
              <span>{amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>
            );
          }}
          sortable
        />
        <Column field="reference" header="Reference" sortable />
        <Column
          field="created_at"
          header="Created At"
          body={({ created_at }) => <span>{new Date(created_at).toLocaleString()}</span>}
          sortable
        />
        <Column
          header="Status"
          body={({ id, is_confirmed, denied_reason }) => {
            const isPending = is_confirmed === null;
            const isDenied = is_confirmed === false;

            if (isPending) {
              return (
                <Row>
                  <Button
                    label="Approve"
                    severity="success"
                    icon="pi pi-check"
                    onClick={e => confirmApproval(e, id)}
                  />
                  <Button
                    label="Deny"
                    severity="danger"
                    icon="pi pi-times"
                    outlined
                    onClick={() => setDenyThis(id)}
                  />
                </Row>
              );
            } else if (isDenied) {
              return (
                <>
                  <Tooltip content={denied_reason} position="top" target={`.pi-${id}`} />
                  <i className={cx('pi', 'pi-times-circle', `pi-${id}`)} style={{ color: 'red' }} />
                </>
              );
            }

            return <i className="pi pi-check-circle" style={{ color: 'green' }}></i>;
          }}
        />
      </DataTable>
    </>
  );

  function confirmApproval(event, id) {
    confirmPopup({
      target: event.currentTarget,
      message: 'Are you sure you want to Approve this Client?',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {}
    });
  }
}
