import { Card } from 'primereact/card';
import { Button } from 'primereact/button';

import { Role } from 'types/roles';

import { Row, Column } from 'components/Group';
import { Modal } from 'components/Modal';

import ClientList from './components/ClientList';
import ClientForm from './components/ClientForm';

function Clients() {
  return (
    <Column gap="4" fullWidth>
      <Card
        header={
          <Row justify="between" align="center" mx={4} mt={4}>
            <h2 className="my-0">Clients</h2>
            <Modal
              header="Add Client"
              trigger={<Button label="Add Client" type="button" icon="pi pi-plus" />}
            >
              <ClientForm />
            </Modal>
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
