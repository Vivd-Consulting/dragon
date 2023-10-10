import { useQuery } from '@apollo/client';
import { useRouter } from 'next/router';

import { Card } from 'primereact/card';

import ContractorForm from 'pages/contractors/components/ContractorForm';

import contractorQuery from '../queries/contractor.gql';

export default function EditContractor() {
  const router = useRouter();
  const { id: contractorId } = router.query;

  const { data, loading } = useQuery(contractorQuery, {
    variables: {
      id: contractorId
    },
    fetchPolicy: 'no-cache'
  });

  return (
    <Card>
      <h1>Edit Contractor</h1>
      {!loading && <ContractorForm defaultValues={data?.contractor_by_pk} />}
    </Card>
  );
}
