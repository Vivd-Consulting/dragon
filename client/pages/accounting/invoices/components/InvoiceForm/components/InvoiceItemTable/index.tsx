import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { InputNumber } from 'primereact/inputnumber';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';

import { Row } from 'components/Group';

const CURRENCIES = ['CAD', 'USD', 'TRY'];

export default function InvoiceItemTable({ formHook }) {
  const { getValues, setValue, watch } = formHook;

  const invoiceItems = watch('invoice_items');

  const header = (
    <Row className="w-full" align="center" justify="between">
      <span>Invoice Items</span>
      <Button
        onClick={() => {
          const items = getInvoiceItems();

          const updatedItems = [
            {
              key: items.length + 1,
              description: '',
              currency: 'CAD',
              tax: 0,
              price: 0
            },
            ...items
          ];

          onAddItems(updatedItems);
        }}
        tooltip="Add invoice item"
        tooltipOptions={{ position: 'top' }}
        type="button"
        icon="pi pi-plus"
        text
      />
    </Row>
  );

  return (
    <DataTable
      header={header}
      value={invoiceItems}
      editMode="row"
      dataKey="key"
      onRowEditComplete={onRowEditComplete}
      tableStyle={{ minWidth: '50rem', marginBottom: '1rem' }}
      scrollHeight="400px"
    >
      <Column
        field="description"
        header="Description"
        editor={options => textEditor(options)}
        style={{ width: '20%' }}
      />

      <Column
        field="currency"
        header="Currency"
        editor={options => currencyEditor(options)}
        style={{ width: '20%' }}
      />

      <Column
        field="tax"
        header="Tax"
        body={taxBodyTemplate}
        editor={options => numberEditor(options)}
        style={{ width: '20%' }}
      />

      <Column
        field="price"
        header="Price"
        body={priceBodyTemplate}
        editor={options => priceEditor(options)}
        style={{ width: '20%' }}
      />

      <Column
        rowEditor
        headerStyle={{ width: '10%', minWidth: '8rem' }}
        bodyStyle={{ textAlign: 'center' }}
      />

      <Column
        body={data => {
          return (
            <Button
              onClick={() => {
                const filteredItems = getInvoiceItems().filter(item => item.key !== data.key);

                onAddItems(filteredItems);
              }}
              tooltip="Remove invoice item"
              tooltipOptions={{ position: 'top' }}
              text
              icon="pi pi-trash"
            />
          );
        }}
        headerStyle={{ width: '10%', minWidth: '8rem' }}
        bodyStyle={{ textAlign: 'center' }}
      />
    </DataTable>
  );

  function getInvoiceItems() {
    return getValues('invoice_items') || [];
  }

  function onAddItems(items) {
    setValue('invoice_items', items);
  }

  function textEditor(options) {
    return (
      <InputText
        type="text"
        value={options.value}
        onChange={e => options.editorCallback(e.target.value)}
      />
    );
  }

  function numberEditor(options) {
    return (
      <InputNumber
        suffix="%"
        locale="en-US"
        minFractionDigits={2}
        value={options.value}
        onChange={e => options.editorCallback(e.value)}
      />
    );
  }

  function priceEditor(options) {
    return (
      <InputNumber
        value={options.value}
        onValueChange={e => options.editorCallback(e.value)}
        mode="currency"
        currency="USD"
        locale="en-US"
      />
    );
  }

  function currencyEditor(options) {
    return (
      <Dropdown
        value={options.value}
        options={CURRENCIES}
        onChange={e => options.editorCallback(e.value)}
        placeholder="Select a Status"
        itemTemplate={option => {
          return <span>{option}</span>;
        }}
      />
    );
  }

  function priceBodyTemplate(rowData) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
      rowData.price
    );
  }

  function taxBodyTemplate(rowData) {
    return <span>{`${rowData.tax}%`}</span>;
  }

  function onRowEditComplete(e) {
    let _items = [...getInvoiceItems()];
    let { newData, index } = e;

    _items[index] = newData;

    onAddItems(_items);
  }
}
