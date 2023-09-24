import { Card } from 'primereact/card';

import InvoiceForm from '../components/InvoiceForm';

export default function CreateInvoice() {
  return (
    <Card>
      <h1>Create Invoice</h1>
      <InvoiceForm />
    </Card>
  );
}
