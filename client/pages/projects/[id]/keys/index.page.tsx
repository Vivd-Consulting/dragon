import { useRouter } from 'next/router';

import { Card } from 'primereact/card';

import { Role } from 'types/roles';

import { Row, Column } from 'components/Group';

import SecretKeysList from './components/SecretKeysList';
import SecretKeyFormModal from './components/SecretKeyFormModal';

export default function ProjectSecretKeys() {
  const router = useRouter();
  const { id: projectId } = router.query;

  if (!projectId) {
    return null;
  }

  return (
    <Column gap="4" fullWidth>
      <Card
        header={
          <Column>
            <Row justify="between" align="center" mx={4} mt={4}>
              <h2 className="my-0">Secret Keys</h2>
              <SecretKeyFormModal projectId={projectId} />
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
