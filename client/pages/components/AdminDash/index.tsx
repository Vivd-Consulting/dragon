import { useState } from 'react';
import { useQuery } from '@apollo/client';
// import dateFns from 'date-fns/locale';
import { Card } from 'primereact/card';
import { Tag } from 'primereact/tag';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { DataTable } from 'primereact/datatable';
import { Column as PColumn } from 'primereact/column';
import { ResponsiveContainer } from 'recharts';

import { Column, Row } from 'components/Group';

import useAdAccounts, { getAdsHistory } from 'hooks/useAdAccounts';
import useUsers from 'hooks/useUsers';

import { SpendBarChart } from '../SpendChart';

import adminCardsQuery from './queries/adminCards.gql';

const thisMonth = [
  new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
];

export default function UserDash() {
  const { data: adminStats } = useQuery(adminCardsQuery);

  const [dates, setDates] = useState<any>(thisMonth);
  const [selectedAdAccount, setSelectedAdAccount] = useState<any>();
  const [selectedUser, setSelectedUser] = useState<any>();

  const { adAccounts } = useAdAccounts(selectedUser);

  const { spendHistory, spendHistoryMonthly, spendByDay, spendThisMonth } = getAdsHistory(
    adAccounts,
    selectedAdAccount
  );

  // TODO: Wrap in useCallback
  const filterExplination = (() => {
    let beginning = 'Showing data for';

    if (selectedAdAccount) {
      const selectedAdAccountName = adAccounts.find(({ id }) => id === selectedAdAccount)?.name;

      beginning = `${beginning} ${selectedAdAccountName}`;
    } else {
      beginning = `${beginning} all accounts`;
    }

    if (dates[0] && dates[1]) {
      beginning = `${beginning} between ${dates[0].toLocaleDateString()} and ${dates[1].toLocaleDateString()}`;
    }

    return beginning;
  })();

  return (
    <Column fullWidth gap="4">
      <Column justify="between" align="center" fullWidth>
        <Row gap="4" fullWidth>
          <Card title="Total Account Balances">
            <Row justify="between" align="center">
              <h1 className="text-2xl font-bold">
                {adminStats?.totalBalance?.toLocaleString('en-US', {
                  style: 'currency',
                  currency: 'USD'
                })}
              </h1>
              <i className="pi pi-wallet text-4xl"></i>
            </Row>
          </Card>
          <Card title={`${new Date().toLocaleString('default', { month: 'long' })} Spend`}>
            <Row justify="between" align="center">
              <h1 className="text-2xl font-bold">
                {spendThisMonth?.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
              </h1>
              <i className="pi pi-calendar text-4xl"></i>
            </Row>
          </Card>
          <Card title="Active Subscribers">
            <Row justify="between" align="center">
              <h1 className="text-2xl font-bold">
                {adminStats?.dragon_user_aggregate.aggregate.count}
              </h1>
              <i className="pi pi-credit-card text-4xl"></i>
            </Row>
          </Card>
        </Row>
      </Column>

      <h2 className="mb-0">Filter charts and tables</h2>
      <Row gap="4">
        <Calendar
          value={dates}
          onChange={e => setDates(e.value)}
          selectionMode="range"
          readOnlyInput
        />
        <UsersDropdown selectedUser={selectedUser} setSelectedUser={setSelectedUser} />
        {adAccounts?.length > 1 && (
          <AdAccountsDropdown
            selectedUser={selectedUser}
            selectedAdAccount={selectedAdAccount}
            setSelectedAdAccount={setSelectedAdAccount}
          />
        )}
      </Row>

      <Row gap="4" fullWidth>
        <Card title="Daily Spend" subTitle={filterExplination}>
          <ResponsiveContainer width="95%" height={400}>
            <SpendBarChart spendHistory={spendByDay} />
          </ResponsiveContainer>
        </Card>
        <Card title="Monthly Spend" subTitle={filterExplination}>
          <ResponsiveContainer width="95%" height={400}>
            <SpendBarChart spendHistory={spendHistoryMonthly} />
          </ResponsiveContainer>
        </Card>
      </Row>

      {/* TODO: Make a version that is by user */}
      <Card title="Spend History" subTitle={filterExplination}>
        <DataTable
          value={spendHistory}
          // paginator
          // lazy
          // onPage={onPage}
          // first={paginationValues.first}
          // rows={paginationValues.rows}
          // onSort={onPage}
          // sortField={paginationValues.sortField}
          // sortOrder={paginationValues.sortOrder}
          // totalRecords={totalRecords}
          removableSort
          responsiveLayout="scroll"
          paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
          currentPageReportTemplate="Showing {first} to {last} of {totalRecords}"
          rowsPerPageOptions={[10, 25, 50, 100]}
          emptyMessage="No Wires found."
          data-cy="wires-table"
        >
          <PColumn field="ad_account_id" header="Account ID" sortable />
          <PColumn
            field="ad_account_id"
            header="Account Name"
            body={({ ad_account_id }) => {
              const name = adAccounts.find(({ id }) => id === ad_account_id)?.name;

              return <span>{name.length > 24 ? `${name.substring(0, 24)}...` : name}</span>;
            }}
            sortable
          />
          <PColumn field="spend" header="Spend" sortable />
          <PColumn field="date_start" header="Date Start" sortable />
          <PColumn field="date_stop" header="Date Stop" sortable />
        </DataTable>
      </Card>
    </Column>
  );
}

function UsersDropdown({ selectedUser, setSelectedUser }) {
  const [users] = useUsers();

  return (
    <Dropdown
      placeholder="Filter by Users"
      value={selectedUser}
      onChange={({ value }) => setSelectedUser(value)}
      options={users}
      optionLabel="name"
      optionValue="id"
      showClear
    />
  );
}

function AdAccountsDropdown({ selectedUser, selectedAdAccount, setSelectedAdAccount }) {
  const { adAccounts } = useAdAccounts(selectedUser);

  return (
    <Dropdown
      placeholder="Filter by Ad Account"
      value={selectedAdAccount}
      onChange={({ value }) => setSelectedAdAccount(value)}
      options={adAccounts}
      optionLabel="name"
      optionValue="id"
      showClear
    />
  );
}
