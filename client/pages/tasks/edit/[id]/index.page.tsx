import { useQuery } from '@apollo/client';
import { useRouter } from 'next/router';

import { Card } from 'primereact/card';

import TaskForm from 'pages/tasks/components/TaskForm';

import taskQuery from '../queries/task.gql';

export default function EditTask() {
  const router = useRouter();
  const { id: taskId } = router.query;

  const { data: task, loading: isTaskLoading } = useQuery(taskQuery, {
    variables: {
      id: taskId
    }
  });

  return (
    <Card>
      <h1>Edit Client</h1>
      <TaskForm initialData={task} isInitialDataLoading={isTaskLoading} />
    </Card>
  );
}
