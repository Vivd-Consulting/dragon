import { useQuery } from '@apollo/client';
import { useRouter } from 'next/router';

import { Card } from 'primereact/card';

import ProjectForm from 'pages/clients/projects/components/ProjectForm';

import projectQuery from '../queries/project.gql';

export default function EditClient() {
  const router = useRouter();
  const { id: projectId } = router.query;

  const { data: project, loading: isProjectLoading } = useQuery(projectQuery, {
    variables: {
      id: projectId
    }
  });

  return (
    <Card>
      <h1>Edit Project</h1>
      <ProjectForm initialData={project} isInitialDataLoading={isProjectLoading} />
    </Card>
  );
}
