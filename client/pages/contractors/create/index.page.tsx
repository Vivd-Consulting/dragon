import { Card } from 'primereact/card';

import ContractorForm from '../components/ContractorForm';

export default function CreateContractor() {
  return (
    <Card>
      <h1>Create Contractor</h1>
      <ContractorForm />
    </Card>
  );
}
