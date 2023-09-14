import { useRouter } from 'next/router';

import { Card } from 'primereact/card';
import { Button } from 'primereact/button';

import { Role } from 'types/roles';

import { Row, Column } from 'components/Group';

import TaskList from './components/TaskList';

export default function Tasks() {
  const router = useRouter();

  return (
    <Column gap="4" fullWidth>
      <Card
        header={
          <Column>
            <Row justify="between" align="center" mx={4} mt={4}>
              <h2 className="my-0">Tasks</h2>
              <Button
                onClick={() => router.push('/tasks/create')}
                label="Add Tasks"
                type="button"
                icon="pi pi-plus"
                raised
              />
            </Row>
          </Column>
        }
      >
        <TaskList />
      </Card>
    </Column>
  );
}

Tasks.roles = [Role.Admin, Role.Client, Role.Contractor];
