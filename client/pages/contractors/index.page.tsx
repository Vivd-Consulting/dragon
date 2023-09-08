import { useRouter } from 'next/router';

import { Card } from 'primereact/card';
import { Button } from 'primereact/button';

import { Row, Column } from 'components/Group';

import { Role } from 'types/roles';

import ContractorList from './components/ContractorList';

export default function Contractors() {
  const router = useRouter();

  return (
    <Column gap="4" fullWidth>
      <Card
        header={
          <Row justify="between" align="center" mx={4} mt={4}>
            <h2 className="my-0">Contractors</h2>
            <Button
              onClick={() => router.push('/contractors/create')}
              label="Add Contractor"
              type="button"
              icon="pi pi-plus"
              raised
            />
          </Row>
        }
      >
        <ContractorList />
      </Card>
    </Column>
  );
}

Contractors.roles = [Role.Admin];
