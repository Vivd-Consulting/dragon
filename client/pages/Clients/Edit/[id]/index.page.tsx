import { useQuery } from '@apollo/client';
import { useRouter } from 'next/router';

import ClientForm from '../../components/ClientForm';

import clientQuery from '../queries/client.gql';

export default function EditClient() {
  const router = useRouter();
  const { id: clientId } = router.query;

  const { data: client } = useQuery(clientQuery, {
    variables: {
      id: clientId
    }
  });

  return (
    <div>
      <h1>Edit Client</h1>
      <ClientForm initialData={client} />
    </div>
  );
}
