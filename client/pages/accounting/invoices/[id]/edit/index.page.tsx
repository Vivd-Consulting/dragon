import { useQuery } from '@apollo/client';
import { useRouter } from 'next/router';

import { Card } from 'primereact/card';

import InvoiceForm from '../../components/InvoiceForm';

import invoiceQuery from './queries/invoice.gql';

export default function EditInvoice() {
  const router = useRouter();
  const { id: invoiceId } = router.query;

  const { data: invoice, loading: isInvoiceLoading } = useQuery(invoiceQuery, {
    variables: {
      id: invoiceId
    }
  });

  return (
    <Card>
      <h1>Edit Invoice</h1>
      <InvoiceForm initialData={invoice} isInitialDataLoading={isInvoiceLoading} />
    </Card>
  );
}
