import { Card } from 'primereact/card';

import { Role } from 'types/roles';

import { Row, Column } from 'components/Group';

import ClientList from './components/ClientList';

function Clients() {
  return (
    <Column gap="4" fullWidth>
      <Card
        header={
          <Row justify="between" align="center" mx={4} mt={4}>
            <h2 className="my-0">Clients</h2>
          </Row>
        }
      >
        <ClientList />
      </Card>
    </Column>
  );
}

Clients.roles = [Role.Admin];

export default Clients;
