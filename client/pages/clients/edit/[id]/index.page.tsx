import { useQuery } from '@apollo/client';
import { useRouter } from 'next/router';

import { Card } from 'primereact/card';

import { Row } from 'components/Group';
import BackButton from 'components/BackButton';

import ClientForm from '../../components/ClientForm';

import clientQuery from '../queries/client.gql';

export default function EditClient() {
  const router = useRouter();
  const { id: clientId } = router.query;

  const { data, loading } = useQuery(clientQuery, {
    variables: {
      id: clientId
    },
    fetchPolicy: 'no-cache'
  });

  return (
    <Card>
      <Row align="center" gap="2">
        <BackButton />
        <h1>Edit Client</h1>
      </Row>
      {!loading && <ClientForm defaultValues={data?.client_by_pk} />}
    </Card>
  );
}
