import { useRouter } from 'next/router';

import { Card } from 'primereact/card';
import { Button } from 'primereact/button';

import { Role } from 'types/roles';

import { Row, Column } from 'components/Group';
import BackButton from 'components/BackButton';

import ProjectList from './components/ProjectList';

export default function ClientProjects() {
  const router = useRouter();
  const { id: clientId } = router.query;

  return (
    <Column gap="4" fullWidth>
      <Card
        header={
          <Column>
            <Row justify="between" align="center" mx={4} mt={4}>
              <Row align="center" gap="2">
                <BackButton />
                <h2 className="my-0">Projects</h2>
              </Row>
              <Button
                onClick={() => router.push('/projects/create')}
                label="Add Project"
                type="button"
                icon="pi pi-plus"
                raised
              />
            </Row>
          </Column>
        }
      >
        <ProjectList clientId={clientId} />
      </Card>
    </Column>
  );
}

ClientProjects.roles = [Role.Admin];
