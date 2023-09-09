import { useRouter } from 'next/router';

import { Card } from 'primereact/card';
import { Button } from 'primereact/button';

import { Role } from 'types/roles';

import { Row, Column } from 'components/Group';

import ProjectList from './components/ProjectsList';

export default function Projects() {
  const router = useRouter();

  return (
    <Column gap="4" fullWidth>
      <Card
        header={
          <Column>
            <Row justify="between" align="center" mx={4} mt={4}>
              <h2 className="my-0">Projects</h2>
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
        <ProjectList />
      </Card>
    </Column>
  );
}

Projects.roles = [Role.Admin];
