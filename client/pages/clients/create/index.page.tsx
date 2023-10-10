import { Card } from 'primereact/card';

import { Row } from 'components/Group';
import BackButton from 'components/BackButton';

import ClientForm from '../components/ClientForm';

export default function CreateClient() {
  return (
    <Card>
      <Row align="center" gap="2">
        <BackButton />
        <h1>Create Client</h1>
      </Row>
      <ClientForm />
    </Card>
  );
}
