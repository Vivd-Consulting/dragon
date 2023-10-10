import { useQuery } from '@apollo/client';
import { useRouter } from 'next/router';

import { Card } from 'primereact/card';

import { Row } from 'components/Group';
import BackButton from 'components/BackButton';

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
      <Row align="center" gap="2">
        <BackButton />
        <h1>Edit Project</h1>
      </Row>
      {!loading && <ProjectForm defaultValues={data?.project_by_pk} />}
    </Card>
  );
}
