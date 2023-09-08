import { Card } from 'primereact/card';

import ClientForm from '../components/ClientForm';

export default function CreateClient() {
  return (
    <Card>
      <h1>Create Client</h1>
      <ClientForm />
    </Card>
  );
}
