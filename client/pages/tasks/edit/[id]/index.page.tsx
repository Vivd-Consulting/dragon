import { useQuery } from '@apollo/client';
import { useRouter } from 'next/router';

import { Card } from 'primereact/card';

import TaskForm from 'pages/tasks/components/TaskForm';

import taskQuery from '../queries/task.gql';

export default function EditTask() {
  const router = useRouter();
  const { id: taskId } = router.query;

  const { data, loading } = useQuery(taskQuery, {
    variables: {
      id: taskId
    },
    fetchPolicy: 'no-cache'
  });

  return (
    <Card>
      <h1>Edit Task</h1>
      {!loading && <TaskForm defaultValues={data?.task_by_pk} />}
    </Card>
  );
}
