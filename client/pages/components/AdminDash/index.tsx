import { Card } from 'primereact/card';

import { Column, Row } from 'components/Group';

import { useClientsQuery } from 'hooks/useClientsQuery';
import {
  useContractorTimeSpent,
  useContractorsMetric,
  useTotalTimeConsumption
} from 'hooks/useDashboardMetrics';

import { getCurrentMonth } from 'utils';

export default function AdminDash() {
  const [billings, expenses] = useContractorsMetric();
  const [totalTimeSpentByCurrentContractor] = useContractorTimeSpent();
  const [mostTimeConsumingClient, mostTimeConsumingProject] = useTotalTimeConsumption();
  const [clients] = useClientsQuery();

  const currentMonthName = getCurrentMonth();

  return (
    <Column gap="4" fullWidth>
      <Card className="bg-transparent shadow-none">
        <Column gap="4" fullWidth>
          <Row align="center" gap="5" wrap>
            <DashboardCard title={`${currentMonthName} Billings`}>
              <p>{billings}</p>
              <i className="pi pi-money-bill" style={{ fontSize: '1.5rem' }} />
            </DashboardCard>

            <DashboardCard title={`${currentMonthName} Expenses`}>
              <p>{expenses}</p>
              <i className="pi pi-wallet" style={{ fontSize: '1.5rem' }} />
            </DashboardCard>

            <DashboardCard title="Active Clients">
              <p>{clients?.length}</p>
              <i className="pi pi-users" style={{ fontSize: '1.5rem' }} />
            </DashboardCard>
          </Row>

          <Row align="center" gap="5" wrap>
            <DashboardCard title="Total Time Spent">
              <p>{totalTimeSpentByCurrentContractor}</p>
              <i className="pi pi-clock" style={{ fontSize: '1.5rem' }} />
            </DashboardCard>

            <DashboardCard title="Most Time Consuming Client">
              <Row align="center" gap="2">
                {/* @ts-ignore */}
                <p>{mostTimeConsumingClient.clientName}</p>
                <span>-</span>
                {/* @ts-ignore */}
                <p>{mostTimeConsumingClient?.duration}</p>
              </Row>
              <i className="pi pi-clock" style={{ fontSize: '1.5rem' }} />
            </DashboardCard>

            <DashboardCard title="Top Project">
              <Row align="center" gap="2">
                {/* @ts-ignore */}
                <p>{mostTimeConsumingProject?.projectName}</p>
                <span>-</span>
                {/* @ts-ignore */}
                <p>{mostTimeConsumingProject?.duration}</p>
              </Row>
              <i className="pi pi-clock" style={{ fontSize: '1.5rem' }} />
            </DashboardCard>
          </Row>
        </Column>
      </Card>
    </Column>
  );
}

function DashboardCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card title={title} className="flex-1" style={{ whiteSpace: 'nowrap' }}>
      <Row align="center" justify="between">
        {children}
      </Row>
    </Card>
  );
}
