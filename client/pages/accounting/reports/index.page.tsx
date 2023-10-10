import { useState } from 'react';
import { useQuery } from '@apollo/client';

import DashboardCard from 'components/DashboardCard';
import { Column, Row } from 'components/Group';

import { getCurrentMonth } from 'utils';

import { SpendBarChart } from './components/SpendBarChart';

import transactionsQuery from './queries/transactions.gql';

export default function Reports() {
  const currentMonthName = getCurrentMonth();

  const [isBusiness, setIsBusiness] = useState(true);

  const where: any = {
    gic_category_id: { _is_null: false },
    account: { excluded: { _eq: false } },
    gicCategory: { is_business: { _eq: isBusiness } }
  };

  const { data: transactionData } = useQuery(transactionsQuery, {
    variables: {
      where
    }
  });

  const transactions = transactionData?.accounting_transactions || [];

  return (
    <Column>
      {/* <Row>
        <DashboardCard title={`${currentYearName} Debits`}>
          <p>{add up all debits for this yaer}</p>
          <i className="pi pi-wallet" style={{ fontSize: '1.5rem' }} />
        </DashboardCard>

        <DashboardCard title={`${currentYearName} Credits`}>
          <p>{add up all credits for this month}</p>
          <i className="pi pi-wallet" style={{ fontSize: '1.5rem' }} />
        </DashboardCard>

        <DashboardCard title={`${currentYearName} Income`}>
          <p>{credit - income}</p>
          <i className="pi pi-wallet" style={{ fontSize: '1.5rem' }} />
        </DashboardCard>
      </Row> */}
      <Row>
        <DashboardCard title={`${currentMonthName} Debits`}>
          {/* <p>{add up all debits for this month}</p> */}
          <i className="pi pi-wallet" style={{ fontSize: '1.5rem' }} />
        </DashboardCard>

        {/* Show total credit for this month (convert any USD to CAD at * 1.35) - we'll add the live rate later */}
        <DashboardCard title={`${currentMonthName} Credits`}>
          {/* <p>{add up all credits for this month}</p> */}
          <i className="pi pi-wallet" style={{ fontSize: '1.5rem' }} />
        </DashboardCard>
      </Row>

      <SpendBarChart spendHistory={transactions} />
    </Column>
  );
}
