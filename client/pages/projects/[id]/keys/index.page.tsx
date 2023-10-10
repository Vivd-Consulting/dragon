import _ from 'lodash';
import { useRouter } from 'next/router';
import { useQuery } from '@apollo/client';

import { Card } from 'primereact/card';

import { Role } from 'types/roles';

import { Row, Column } from 'components/Group';
import BackButton from 'components/BackButton';

import SecretKeysList from './components/SecretKeysList';
import SecretKeyFormModal from './components/SecretKeyFormModal';

import projectQuery from './queries/project.gql';

export default function ProjectSecretKeys() {
  const router = useRouter();
  const { id: projectId } = router.query;

  const { data } = useQuery(projectQuery, {
    variables: {
      projectId
    },
    skip: !projectId
  });

  if (!projectId || !data) {
    return null;
  }

  const projectName = _.get(data, 'project[0].name');

  return (
    <Column gap="4" fullWidth>
      <Card
        header={
          <Column>
            <Row justify="between" align="center" mx={4} mt={4}>
              <Row align="center" gap="2">
                <BackButton />
                <h2 className="my-0">{`${projectName} Secret Keys`}</h2>
              </Row>
              <SecretKeyFormModal projectName={projectName} projectId={projectId as string} />
            </Row>
          </Column>
        }
      >
        <SecretKeysList projectId={projectId} />
      </Card>
    </Column>
  );
}

ProjectSecretKeys.roles = [Role.Admin];
