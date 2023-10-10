import { useQuery } from '@apollo/client';
import { useRouter } from 'next/router';

import { Card } from 'primereact/card';

import ProjectForm from '../../components/ProjectForm';

import projectQuery from '../queries/project.gql';

export default function EditProject() {
  const router = useRouter();
  const { id: projectId } = router.query;

  const { data, loading } = useQuery(projectQuery, {
    variables: {
      id: projectId
    },
    fetchPolicy: 'no-cache'
  });

  return (
    <Card>
      <h1>Edit Project</h1>
      {!loading && <ProjectForm defaultValues={data?.project_by_pk} />}
    </Card>
  );
}
