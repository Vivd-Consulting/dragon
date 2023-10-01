import { Card } from 'primereact/card';

import { Row, Column } from 'components/Group';

import { Role } from 'types/roles';

import DebitList from './components/DebitList';
import CreditList from './components/CreditList';

export default function Contractors() {
  return (
    <Column gap="4" fullWidth>
      <Card
        header={
          <Row justify="between" align="center" mx={4} mt={4}>
            <h2 className="my-0">Debits</h2>
          </Row>
        }
      >
        <DebitList />
      </Card>

      <Card
        header={
          <Row justify="between" align="center" mx={4} mt={4}>
            <h2 className="my-0">Credits</h2>
          </Row>
        }
      >
        <CreditList />
      </Card>
    </Column>
  );
}

Contractors.roles = [Role.Admin];
