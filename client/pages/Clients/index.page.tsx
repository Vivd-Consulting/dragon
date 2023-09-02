import { useRouter } from 'next/router';

import { Card } from 'primereact/card';
import { Button } from 'primereact/button';

import { Row, Column } from 'components/Group';

import { Role } from 'types/roles';

import ClientList from './components/ClientList';

function Clients() {
  const router = useRouter();

  return (
    <Column gap="4" fullWidth>
      <Card
        header={
          <Row justify="between" align="center" mx={4} mt={4}>
            <h2 className="my-0">Clients</h2>
            <Button
              onClick={() => router.push('/clients/create')}
              label="Add Client"
              type="button"
              icon="pi pi-plus"
              raised
            />
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
