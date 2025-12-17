'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';

import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { confirmDialog } from 'primereact/confirmdialog';
import { Toast } from 'primereact/toast';
import { Badge } from 'primereact/badge';
import { InputSwitch } from 'primereact/inputswitch';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { FileUpload } from 'primereact/fileupload';
import { Tag } from 'primereact/tag';

import { Row, Column as Col } from '@/components/Group';
import { getInvoices, archiveInvoice, updateInvoice, createInvoice } from '@/app/actions/invoices';
import { getTransactions } from '@/app/actions/accounting';
import { updateTransaction } from '@/app/actions/accounting';
import { dateFormat, getNextWeek } from '@/utils';
import { Calendar } from 'primereact/calendar';
import { getClients } from '@/app/actions/clients';

export default function InvoiceList() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalRecords, setTotalRecords] = useState(0);
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(10);
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [availableTransactions, setAvailableTransactions] = useState<any[]>([]);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [showCreateInvoiceModal, setShowCreateInvoiceModal] = useState(false);
  const [uploadedFileInfo, setUploadedFileInfo] = useState<any | null>(null);
  const [selectedClientId, setSelectedClientId] = useState<number | undefined>(undefined);
  const [clients, setClients] = useState<any[]>([]);
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);

  const toastRef = useRef<Toast>(null);
  const router = useRouter();
  const fileUploadRef = useRef<any>(null);

  useEffect(() => {
    loadInvoices();
  }, [first, rows]);

  useEffect(() => {
    async function loadClients() {
      try {
        const result = await getClients({
          archived_at: { _is_null: true },
        });
        if ('data' in result) {
          setClients(result.data || []);
        }
      } catch (error) {
        console.error('Failed to load clients:', error);
      }
    }
    loadClients();
  }, []);

  async function loadInvoices() {
    setLoading(true);
    try {
      const result = await getInvoices({
        limit: rows,
        offset: first,
        archived_at: { _is_null: true },
      });

      if ('error' in result) {
        toastRef.current?.show({
          severity: 'error',
          summary: 'Error',
          detail: result.error,
          life: 3000,
        });
        return;
      }

      setInvoices(result.data || []);
      setTotalRecords(result.total || 0);
    } catch (error) {
      toastRef.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load invoices',
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  }

  const onPage = (event: any) => {
    setFirst(event.first);
    setRows(event.rows);
  };

  async function togglePaidStatus(invoice: any) {
    try {
      const newPaidAt = invoice.paid_at ? null : new Date();
      const result = await updateInvoice(invoice.id, { paid_at: newPaidAt });

      if ('error' in result) {
        toastRef.current?.show({
          severity: 'error',
          summary: 'Error',
          detail: result.error,
          life: 3000,
        });
        return;
      }

      toastRef.current?.show({
        severity: 'success',
        summary: 'Success',
        detail: invoice.paid_at ? 'Invoice marked as unpaid' : 'Invoice marked as paid',
        life: 3000,
      });

      loadInvoices();
    } catch (error) {
      toastRef.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to update invoice status',
        life: 3000,
      });
    }
  }

  async function openTransactionModal(invoice: any) {
    setSelectedInvoice(invoice);
    
    // Load available transactions (unassociated transactions)
    try {
      const result = await getTransactions({
        limit: 100,
        offset: 0,
        where: {
          invoice_id: { _is_null: true },
        },
      });

      if ('data' in result) {
        setAvailableTransactions(result.data || []);
      }
    } catch (error) {
      console.error('Failed to load transactions:', error);
    }

    setShowTransactionModal(true);
  }

  async function associateTransaction(transactionId: string | number) {
    if (!selectedInvoice) return;

    try {
      const result = await updateTransaction(transactionId, {
        invoice_id: selectedInvoice.id,
      });

      if ('error' in result) {
        toastRef.current?.show({
          severity: 'error',
          summary: 'Error',
          detail: result.error,
          life: 3000,
        });
        return;
      }

      toastRef.current?.show({
        severity: 'success',
        summary: 'Success',
        detail: 'Transaction associated with invoice',
        life: 3000,
      });

      setShowTransactionModal(false);
      setSelectedInvoice(null);
      loadInvoices();
    } catch (error) {
      toastRef.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to associate transaction',
        life: 3000,
      });
    }
  }

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await handleFileUpload(e.dataTransfer.files[0]);
    }
  }, []);

  async function handleFileUpload(file: File) {
    // Validate file type (PDF, images, etc.)
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      toastRef.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Invalid file type. Please upload PDF or image files.',
        life: 3000,
      });
      return;
    }

    setUploadingFile(true);
    try {
      const formData = new FormData();
      formData.append('files', file);

      const uploadTarget = '/api/invoices/upload';
      const req = await fetch(uploadTarget, {
        method: 'POST',
        body: formData,
      });

      if (!req.ok) {
        const errorText = await req.text();
        let errorMessage = 'Failed to upload file';
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.error || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const response = await req.json();

      if (response.error) {
        throw new Error(response.error);
      }

      // Store uploaded file info and show modal to create invoice
      setUploadedFileInfo({
        ...response,
        filename: file.name,
        size: file.size,
        type: file.type,
      });
      setDueDate(getNextWeek());
      setShowCreateInvoiceModal(true);

      toastRef.current?.show({
        severity: 'success',
        summary: 'Success',
        detail: 'File uploaded successfully. Create an invoice below.',
        life: 3000,
      });
    } catch (error: any) {
      toastRef.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: error.message || 'Failed to upload file',
        life: 3000,
      });
    } finally {
      setUploadingFile(false);
    }
  }

  const confirmArchiveInvoice = (data: any) => {
    confirmDialog({
      message: 'Are you sure you want to archive this invoice?',
      header: 'Archive Invoice',
      icon: 'pi pi-exclamation-triangle',
      accept: () => _archiveInvoice(data),
    });
  };

  async function _archiveInvoice(data: any) {
    try {
      const result = await archiveInvoice(data.id);

      if ('error' in result) {
        toastRef.current?.show({
          life: 3000,
          severity: 'error',
          summary: 'Failed to archive invoice.',
          detail: result.error,
        });
        return;
      }

      toastRef.current?.show({
        severity: 'success',
        summary: 'Success',
        detail: 'Invoice is archived!',
        life: 3000,
      });

      loadInvoices();
    } catch (e) {
      toastRef.current?.show({
        life: 3000,
        severity: 'error',
        summary: 'Failed to archive invoice.',
        detail: 'Unable to archive the invoice at this time.',
      });
      console.error(e);
    }
  }

  function statusBodyTemplate({ submitted_at, paid_at }: any) {
    let status = { value: 'Draft', severity: 'warning' as const };

    if (paid_at) {
      status = { value: 'Paid', severity: 'success' as const };
    } else if (submitted_at) {
      status = { value: 'Submitted', severity: 'info' as const };
    }

    return <Badge value={status.value} severity={status.severity} />;
  }

  function paidStatusBodyTemplate(invoice: any) {
    return (
      <InputSwitch
        checked={!!invoice.paid_at}
        onChange={() => togglePaidStatus(invoice)}
      />
    );
  }

  function actionButtonsTemplate(data: any) {
    return (
      <Row gap="1">
        <Button
          size="small"
          tooltip="View"
          tooltipOptions={{ position: 'top' }}
          icon="pi pi-eye"
          onClick={() => router.push(`/accounting/invoices/${data.id}`)}
        />
        <Button
          size="small"
          icon="pi pi-user-edit"
          tooltip="Edit"
          tooltipOptions={{ position: 'top' }}
          onClick={() => router.push(`/accounting/invoices/${data.id}/edit`)}
        />
        <Button
          size="small"
          icon="pi pi-link"
          tooltip="Associate Transaction"
          tooltipOptions={{ position: 'top' }}
          onClick={() => openTransactionModal(data)}
        />
        <Button
          size="small"
          tooltip="Archive"
          tooltipOptions={{ position: 'top' }}
          severity="danger"
          icon="pi pi-trash"
          onClick={() => confirmArchiveInvoice(data)}
        />
      </Row>
    );
  }

  function transactionDropdownTemplate(option: any) {
    if (!option) return <span>Select a transaction</span>;
    
    const isDebit = (option.debit || 0) !== 0;
    const amount = isDebit ? -Math.abs(option.debit || 0) : Math.abs(option.credit || 0);
    const currency = option.currency || 'USD';
    
    return (
      <div className="flex align-items-center justify-content-between">
        <div>
          <div className="font-semibold">{option.description || option.name}</div>
          <div className="text-sm text-gray-500">
            {dateFormat(option.date, true)} • {option.account?.name || 'Unknown Account'}
          </div>
        </div>
        <div className="ml-2">
          <Tag
            value={amount.toLocaleString('en-US', {
              style: 'currency',
              currency: currency,
            })}
            severity={isDebit ? 'danger' : 'success'}
          />
        </div>
      </div>
    );
  }

  return (
    <>
      <Toast ref={toastRef} />

      {/* Drag and Drop Upload Area */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-4 mb-4 text-center transition-colors ${
          dragActive
            ? 'border-primary bg-primary-50'
            : 'border-gray-300 hover:border-gray-400'
        } ${uploadingFile ? 'opacity-50' : ''}`}
      >
        <FileUpload
          ref={fileUploadRef}
          mode="basic"
          name="files"
          accept="application/pdf,image/*"
          maxFileSize={10000000}
          auto
          customUpload
          uploadHandler={async (e) => {
            if (e.files && e.files[0]) {
              await handleFileUpload(e.files[0]);
              e.options.clear();
            }
          }}
          chooseLabel="Drop invoice files here or click to upload"
          className="w-full"
          disabled={uploadingFile}
        />
        {uploadingFile && (
          <div className="mt-2">
            <i className="pi pi-spin pi-spinner mr-2"></i>
            Uploading...
          </div>
        )}
      </div>

      <DataTable
        value={invoices}
        paginator
        lazy
        onPage={onPage}
        first={first}
        rows={rows}
        totalRecords={totalRecords}
        removableSort
        responsiveLayout="scroll"
        paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
        currentPageReportTemplate="Showing {first} to {last} of {totalRecords}"
        rowsPerPageOptions={[10, 25, 50, 100]}
        emptyMessage="No invoices found."
        data-cy="invoices-table"
        loading={loading}
      >
        <Column field="id" header="ID" sortable />
        <Column field="client_name" header="Client Name" sortable />
        <Column
          body={statusBodyTemplate}
          header="Status"
          sortable
          sortField="paid_at"
        />
        <Column
          body={paidStatusBodyTemplate}
          header="Paid"
          style={{ width: '80px' }}
        />
        <Column
          field="due_date"
          header="Due Date"
          body={({ due_date }: any) =>
            due_date ? dateFormat(due_date, true) : '-'
          }
          sortable
        />
        <Column
          field="paid_at"
          header="Paid Date"
          body={({ paid_at }: any) =>
            paid_at ? dateFormat(paid_at, true) : '-'
          }
          sortable
        />
        <Column body={actionButtonsTemplate} header="Actions" />
      </DataTable>

      {/* Transaction Association Modal */}
      <Dialog
        header={`Associate Transaction with Invoice #${selectedInvoice?.id}`}
        visible={showTransactionModal}
        style={{ width: '50vw' }}
        onHide={() => {
          setShowTransactionModal(false);
          setSelectedInvoice(null);
        }}
        footer={
          <div>
            <Button
              label="Cancel"
              icon="pi pi-times"
              onClick={() => {
                setShowTransactionModal(false);
                setSelectedInvoice(null);
              }}
              className="p-button-text"
            />
          </div>
        }
      >
        <Col gap="3">
          <div>
            <label className="block mb-2 font-semibold">Select Transaction</label>
            <Dropdown
              options={availableTransactions}
              optionLabel={(option) =>
                `${option.description || option.name} - ${dateFormat(option.date, true)}`
              }
              optionValue="id"
              placeholder="Select a transaction to associate"
              filter
              showClear
              onChange={(e) => {
                if (e.value) {
                  associateTransaction(e.value);
                }
              }}
              itemTemplate={transactionDropdownTemplate}
              className="w-full"
            />
          </div>
          {selectedInvoice && (
            <div className="text-sm text-gray-600">
              <p>
                <strong>Invoice:</strong> #{selectedInvoice.id}
                {selectedInvoice.client_name && ` - ${selectedInvoice.client_name}`}
              </p>
              {selectedInvoice.paid_at && (
                <p className="text-green-600">
                  <i className="pi pi-check-circle mr-1"></i>
                  This invoice is marked as paid
                </p>
              )}
            </div>
          )}
        </Col>
      </Dialog>

      {/* Create Invoice from Upload Modal */}
      <Dialog
        header="Create Invoice from Uploaded File"
        visible={showCreateInvoiceModal}
        style={{ width: '50vw' }}
        onHide={() => {
          setShowCreateInvoiceModal(false);
          setUploadedFileInfo(null);
          setSelectedClientId(undefined);
          setDueDate(undefined);
        }}
        footer={
          <div>
            <Button
              label="Cancel"
              icon="pi pi-times"
              onClick={() => {
                setShowCreateInvoiceModal(false);
                setUploadedFileInfo(null);
                setSelectedClientId(undefined);
                setDueDate(undefined);
              }}
              className="p-button-text"
            />
            <Button
              label="Create Invoice"
              icon="pi pi-check"
              onClick={handleCreateInvoiceFromUpload}
              disabled={!selectedClientId || !dueDate}
            />
          </div>
        }
      >
        <Col gap="3">
          {uploadedFileInfo && (
            <div className="p-3 border-round border-1 border-gray-300 bg-gray-50">
              <div className="flex align-items-center gap-2 mb-2">
                <i className="pi pi-file text-2xl"></i>
                <div>
                  <div className="font-semibold">{uploadedFileInfo.filename}</div>
                  <div className="text-sm text-gray-600">
                    {(uploadedFileInfo.size / 1024).toFixed(2)} KB • {uploadedFileInfo.type}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block mb-2 font-semibold">Client *</label>
            <Dropdown
              options={clients}
              optionLabel="name"
              optionValue="id"
              placeholder="Select a client"
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.value)}
              filter
              className="w-full"
            />
          </div>

          <div>
            <label className="block mb-2 font-semibold">Due Date *</label>
            <Calendar
              value={dueDate}
              onChange={(e) => setDueDate(e.value as Date | undefined)}
              showIcon
              dateFormat="mm/dd/yy"
              className="w-full"
            />
          </div>

          <div className="text-sm text-gray-600">
            <p>
              <i className="pi pi-info-circle mr-2"></i>
              After creating the invoice, you can add items and associate transactions.
            </p>
          </div>
        </Col>
      </Dialog>
    </>
  );

  async function handleCreateInvoiceFromUpload() {
    if (!selectedClientId || !dueDate) {
      return;
    }

    try {
      const result = await createInvoice({
        client_id: selectedClientId,
        due_date: dueDate,
      });

      if ('error' in result) {
        toastRef.current?.show({
          severity: 'error',
          summary: 'Error',
          detail: result.error,
          life: 3000,
        });
        return;
      }

      toastRef.current?.show({
        severity: 'success',
        summary: 'Success',
        detail: 'Invoice created successfully!',
        life: 3000,
      });

      setShowCreateInvoiceModal(false);
      setUploadedFileInfo(null);
      setSelectedClientId(undefined);
      setDueDate(undefined);

      // Reload invoices and navigate to edit page
      loadInvoices();
      router.push(`/accounting/invoices/${result.data.id}/edit`);
    } catch (error: any) {
      toastRef.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: error.message || 'Failed to create invoice',
        life: 3000,
      });
    }
  }
}
