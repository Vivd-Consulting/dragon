import { useQuery } from '@apollo/client';
import { useRouter } from 'next/router';

import { Card } from 'primereact/card';

import TaskForm from 'pages/tasks/components/TaskForm';

import taskQuery from '../queries/task.gql';

export default function EditTask() {
  const router = useRouter();
  const { id: taskId } = router.query;

  const { data, loading: isTaskLoading } = useQuery(taskQuery, {
    variables: {
      id: taskId
    }
  });
  const task = data?.task_by_pk;

  return (
    <Card>
      <h1>Edit Task</h1>
      <TaskForm initialData={task} isInitialDataLoading={isTaskLoading} />
    </Card>
  );
}
