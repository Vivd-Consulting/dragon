import { useQuery } from '@apollo/client';
import { useRouter } from 'next/router';

import { Card } from 'primereact/card';

import { Row } from 'components/Group';
import BackButton from 'components/BackButton';

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
      <Row align="center" gap="2">
        <BackButton />
        <h1>Edit Task</h1>
      </Row>
      {!loading && <TaskForm defaultValues={data?.task_by_pk} />}
    </Card>
  );
}
