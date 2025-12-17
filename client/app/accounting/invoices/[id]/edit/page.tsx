'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

import InvoiceForm from '../../components/InvoiceForm';
import { getInvoice } from '@/app/actions/invoices';

export default function EditInvoice() {
  const params = useParams();
  const id = Number(params.id);
  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadInvoice() {
      if (!id) return;

      const result = await getInvoice(id);
      if ('data' in result && result.data) {
        setInvoice(result.data);
      }
      setLoading(false);
    }

    loadInvoice();
  }, [id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return <InvoiceForm defaultValues={invoice} />;
}

