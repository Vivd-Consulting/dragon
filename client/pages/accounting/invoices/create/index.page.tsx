import { useRouter } from 'next/router';

import { Card } from 'primereact/card';

import { useContractorInvoices, useCurrentContractor } from 'hooks/useContractors';

import InvoiceForm from '../components/InvoiceForm';

export default function CreateInvoice() {
  const router = useRouter();

  const [contractorId] = useCurrentContractor();

  const [, hasActiveInvoice] = useContractorInvoices(contractorId);

  if (hasActiveInvoice) {
    router.push('/accounting/invoices');
  }

  return (
    <Card>
      <h1>Create Invoice</h1>
      <InvoiceForm />
    </Card>
  );
}
