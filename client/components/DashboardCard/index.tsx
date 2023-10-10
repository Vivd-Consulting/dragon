import { Card } from 'primereact/card';

import { Row } from 'components/Group';

export default function DashboardCard({
  title,
  children
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card title={title} className="flex-1" style={{ whiteSpace: 'nowrap' }}>
      <Row align="center" justify="between">
        {children}
      </Row>
    </Card>
  );
}
