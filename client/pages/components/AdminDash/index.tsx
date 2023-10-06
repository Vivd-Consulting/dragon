import { Card } from 'primereact/card';

import { Column, Row } from 'components/Group';

import { useClientsQuery } from 'hooks/useClientsQuery';

import { getCurrentMonth } from 'utils';
import {
  useContractorTimeSpent,
  useContractorsMetric,
  useMostTimeConsumingClient
} from 'hooks/useDashboardMetrics';

export default function AdminDash() {
  const [billings, expenses] = useContractorsMetric();
  const [totalTimeSpent] = useContractorTimeSpent();
  const [test, test2] = useMostTimeConsumingClient();

  console.log(test, test2);

  const [clients] = useClientsQuery();

  const currentMonthName = getCurrentMonth();

  return (
    <Column gap="4" fullWidth>
      <Card
        header={
          <Row justify="between" align="center" mx={4} mt={4}>
            <h2 className="my-0">Admin dashboard</h2>
          </Row>
        }
      >
        <Row align="center" gap="5" wrap>
          <Card
            title={`${currentMonthName} Billings`}
            className="flex-1"
            style={{ whiteSpace: 'nowrap' }}
          >
            <Row align="center" justify="between">
              <p>{billings}</p>
              <i className="pi pi-money-bill" style={{ fontSize: '1.5rem' }} />
            </Row>
          </Card>

          <Card
            title={`${currentMonthName} Expenses`}
            className="flex-1"
            style={{ whiteSpace: 'nowrap' }}
          >
            <Row align="center" justify="between">
              <p>{expenses}</p>
              <i className="pi pi-wallet" style={{ fontSize: '1.5rem' }} />
            </Row>
          </Card>

          <Card title="Active Clients" className="flex-1" style={{ whiteSpace: 'nowrap' }}>
            <Row align="center" justify="between">
              <p>{clients?.length}</p>
              <i className="pi pi-users" style={{ fontSize: '1.5rem' }} />
            </Row>
          </Card>

          <Card title="Total Time Spent" className="flex-1" style={{ whiteSpace: 'nowrap' }}>
            <Row align="center" justify="between">
              <p>{totalTimeSpent}</p>
              <i className="pi pi-users" style={{ fontSize: '1.5rem' }} />
            </Row>
          </Card>
        </Row>
      </Card>
    </Column>
  );
}
