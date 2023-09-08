import { useMutation } from '@apollo/client';
import { DataTable, DataTablePageEvent } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';

import { confirmDialog } from 'primereact/confirmdialog';

import { Toast } from 'primereact/toast';

import { useMemo, useRef } from 'react';

import useLocationSearch from 'hooks/useLocationSearch';

import { Row } from 'components/Group';

import { usePaginatedQuery } from 'hooks/usePaginatedQuery';

import { ViewUserModal } from '../UserForm';

import usersQuery from './queries/users.gql';
import deleteUserQuery from './queries/deleteUser.gql';
import resetUserPasswordQuery from './queries/resetUserPassword.gql';

export default function UserList() {
  const [search] = useLocationSearch({ key: 'search', initialValue: '' });

  const variables = useMemo(
    () => ({
      search: `%${search}%`
    }),
    [search]
  );

  const {
    query: { loading, error, previousData, data },
    onPage,
    paginationValues
  } = usePaginatedQuery(usersQuery, {
    variables
  });

  if (error) {
    return null;
  }

  const users = loading ? previousData?.dragon_user : data?.dragon_user;
  const totalRecords = loading
    ? previousData?.dragon_user_aggregate.aggregate.count
    : data?.dragon_user_aggregate.aggregate.count;

  return (
    <UsersTable
      users={users}
      totalRecords={totalRecords}
      paginationValues={paginationValues}
      onPage={onPage}
    />
  );
}

function UsersTable({ users, totalRecords, paginationValues, onPage }) {
  const pagination: DataTablePageEvent = paginationValues;
  const [deleteUser] = useMutation(deleteUserQuery, {
    refetchQueries: ['dragon_user']
  });
  const [resetUserPassword] = useMutation(resetUserPasswordQuery);

  const toastRef = useRef<Toast>(null);

  return (
    <>
      <Toast ref={toastRef} />
      <DataTable
        value={users}
        paginator
        lazy
        onPage={onPage}
        first={pagination.first}
        rows={pagination.rows}
        onSort={onPage}
        sortField={pagination.sortField}
        sortOrder={pagination.sortOrder}
        totalRecords={totalRecords}
        removableSort
        responsiveLayout="scroll"
        paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
        currentPageReportTemplate="Showing {first} to {last} of {totalRecords}"
        rowsPerPageOptions={[10, 25, 50, 100]}
        emptyMessage="No Users found."
      >
        <Column field="name" header="Name" sortable />
        <Column
          headerStyle={{ width: '4rem', textAlign: 'center' }}
          bodyStyle={{ textAlign: 'center', overflow: 'visible' }}
          body={actionBodyTemplate}
        />
      </DataTable>
    </>
  );

  function actionBodyTemplate(data: any) {
    const confirmDelete = () => {
      confirmDialog({
        message: `Are you sure you want to Delete ${data.name}?`,
        header: 'Delete User',
        icon: 'pi pi-exclamation-triangle',
        accept: () => _deleteUser(data.id)
      });
    };

    const confirmPasswordReset = () => {
      confirmDialog({
        message: `Are you sure you want to send a password reset for ${data.name}?`,
        header: 'Reset Password',
        icon: 'pi pi-exclamation-triangle',
        accept: () => _resetPassword(data.id)
      });
    };

    return (
      <Row>
        {/* TODO: We should only have 1 instance of this */}
        <ViewUserModal
          user={data}
          trigger={
            <Button
              type="button"
              icon="pi pi-eye"
              tooltip="View"
              tooltipOptions={{ position: 'top' }}
            />
          }
        />
        <Button
          type="button"
          icon="pi pi-envelope"
          onClick={confirmPasswordReset}
          tooltip="Reset Password"
          tooltipOptions={{ position: 'top' }}
        />
        <Button
          type="button"
          icon="pi pi-trash"
          onClick={confirmDelete}
          tooltip="Delete"
          tooltipOptions={{ position: 'top' }}
        />
      </Row>
    );
  }

  async function _resetPassword(id) {
    try {
      return await resetUserPassword({
        variables: { user_id: id }
      });
    } catch (e) {
      toastRef?.current?.show({
        life: 5000,
        severity: 'error',
        summary: 'Failed to Send Password Reset',
        detail: 'Unable to send a password reset email at this time.'
      });
      console.error(e);
    }
  }

  async function _deleteUser(id) {
    try {
      return await deleteUser({
        variables: { user_id: id }
      });
    } catch (e) {
      toastRef?.current?.show({
        life: 5000,
        severity: 'error',
        summary: 'Failed to Delete User',
        detail: 'Unable to delete user at this time.'
      });
      console.error(e);
    }
  }
}
