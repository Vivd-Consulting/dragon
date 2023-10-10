import { Card } from 'primereact/card';

import { Row } from 'components/Group';
import BackButton from 'components/BackButton';

import InvoiceForm from '../components/InvoiceForm';

export default function CreateInvoice() {
  return (
    <Card>
      <Row align="center" gap="2">
        <BackButton />
        <h1>Create Invoice</h1>
      </Row>
      <InvoiceForm />
    </Card>
  );
}
