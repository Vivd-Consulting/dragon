import { Card } from 'primereact/card';

import { Row } from 'components/Group';
import BackButton from 'components/BackButton';

import ProjectForm from '../components/ProjectForm';

export default function CreateProject() {
  return (
    <Card>
      <Row align="center" gap="2">
        <BackButton />
        <h1>Create Project</h1>
      </Row>
      <ProjectForm />
    </Card>
  );
}
