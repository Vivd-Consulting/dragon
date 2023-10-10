import { Card } from 'primereact/card';

import { Row } from 'components/Group';
import BackButton from 'components/BackButton';

import ContractorForm from '../components/ContractorForm';

export default function CreateContractor() {
  return (
    <Card>
      <Row align="center" gap="2">
        <BackButton />
        <h1>Create Contractor</h1>
      </Row>
      <ContractorForm />
    </Card>
  );
}
