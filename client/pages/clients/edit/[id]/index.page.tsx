import { useQuery } from '@apollo/client';
import { useRouter } from 'next/router';

import { Card } from 'primereact/card';

import ClientForm from '../../components/ClientForm';

import clientQuery from '../queries/client.gql';

export default function EditClient() {
  const router = useRouter();
  const { id: clientId } = router.query;

  const { data: client, loading: isClientLoading } = useQuery(clientQuery, {
    variables: {
      id: clientId
    }
  });

  return (
    <Card>
      <h1>Edit Client</h1>
      <ClientForm initialData={client} isInitialDataLoading={isClientLoading} />
    </Card>
  );
}
