import { useQuery } from '@apollo/client';
import { useRouter } from 'next/router';

import { Card } from 'primereact/card';

import InvoiceForm from '../../components/InvoiceForm';

import invoiceQuery from './queries/invoice.gql';

export default function EditInvoice() {
  const router = useRouter();
  const { id: invoiceId } = router.query;

  const { data, loading } = useQuery(invoiceQuery, {
    variables: {
      id: invoiceId
    },
    fetchPolicy: 'no-cache'
  });

  return (
    <Card>
      <h1>Edit Invoice - {`REF-${invoiceId}`}</h1>
      {!loading && <InvoiceForm defaultValues={data?.invoice_by_pk} />}
    </Card>
  );
}
