import { useRouter } from 'next/router';

import { Card } from 'primereact/card';
import { Button } from 'primereact/button';

import { Role } from 'types/roles';

import { Row, Column } from 'components/Group';

import { useContractorInvoices, useCurrentContractor } from 'hooks/useContractors';

import InvoiceList from './components/InvoiceList';

export default function Invoices() {
  const router = useRouter();
  // TODO: Add client
  const [contractorId] = useCurrentContractor();

  const [, hasActiveInvoice] = useContractorInvoices(contractorId);

  return (
    <Column gap="4" fullWidth>
      <Card
        header={
          <Row justify="between" align="center" mx={4} mt={4}>
            <h2 className="my-0">Invoices</h2>
            <Button
              onClick={() => router.push('/accounting/invoices/create')}
              label="Add Invoice"
              type="button"
              icon="pi pi-plus"
              raised
              disabled={hasActiveInvoice}
            />
          </Row>
        }
      >
        <InvoiceList />
      </Card>
    </Column>
  );
}

Invoices.roles = [Role.Admin];
