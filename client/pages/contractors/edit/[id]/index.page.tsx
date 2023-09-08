import { useQuery } from '@apollo/client';
import { useRouter } from 'next/router';

import { Card } from 'primereact/card';

import ContractorForm from 'pages/contractors/components/ContractorForm';

import contractorQuery from '../queries/contractor.gql';

export default function EditContractor() {
  const router = useRouter();
  const { id: contractorId } = router.query;

  const { data: contractor, loading: isContractorLoading } = useQuery(contractorQuery, {
    variables: {
      id: contractorId
    }
  });

  return (
    <Card>
      <h1>Edit Contractor</h1>
      <ContractorForm initialData={contractor} isInitialDataLoading={isContractorLoading} />
    </Card>
  );
}
