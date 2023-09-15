import { Card } from 'primereact/card';

import TaskForm from '../components/TaskForm';

export default function CreateTask() {
  // TODO: add tasks query
  return (
    <Card>
      <h1>Create Task</h1>
      <TaskForm />
    </Card>
  );
}
