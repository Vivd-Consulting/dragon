import { Card } from 'primereact/card';
import { Button } from 'primereact/button';

import { Role } from 'types/roles';

import { Row, Column } from 'components/Group';
import { Modal } from 'components/Modal';

import ContractorList from './components/ContractorList';
import ContractorForm from './components/ContractorForm';

function Contractors() {
  return (
    <Column gap="4" fullWidth>
      <Card
        header={
          <Row justify="between" align="center" mx={4} mt={4}>
            <h2 className="my-0">Contractors</h2>
            <Modal
              header="Add Contractor"
              trigger={<Button label="Add Contractor" type="button" icon="pi pi-plus" />}
            >
              <ContractorForm />
            </Modal>
          </Row>
        }
      >
        <ContractorList />
      </Card>
    </Column>
  );
}

Contractors.roles = [Role.Admin];

export default Contractors;
