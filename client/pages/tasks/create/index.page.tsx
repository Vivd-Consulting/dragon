import { Card } from 'primereact/card';

import { Row } from 'components/Group';
import BackButton from 'components/BackButton';

import TaskForm from '../components/TaskForm';

export default function CreateTask() {
  return (
    <Card>
      <Row align="center" gap="2">
        <BackButton />
        <h1>Create Task</h1>
      </Row>
      <TaskForm />
    </Card>
  );
}
