import _ from 'lodash';
import { useState, useRef } from 'react';
import { useMutation } from '@apollo/client';

import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';

import { Row } from 'components/Group';
import { InputTextDebounced } from 'components/Form';

import { dateFormat } from 'utils';

import { usePaginatedQuery } from 'hooks/usePaginatedQuery';

import CategoryDropdown from './components/CategoryDropdown';
import { CreateRuleModal, UpdateRuleModal } from './components/RuleModal';

import rulesQuery from './queries/rules.gql';
import deleteRuleQuery from './queries/deleteRule.gql';

export default function RulesList() {
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const [searchText, setSearchText] = useState<string | undefined>(undefined);

  const where: any = {
    deleted_at: { _is_null: true }
  };

  if (selectedCategory) {
    where.gic_category_id = { _eq: selectedCategory };
  }

  if (searchText) {
    where.name = { _ilike: `%${searchText}%` };
  }

  const {
    query: { loading, previousData, data },
    paginationValues,
    onPage
  } = usePaginatedQuery(rulesQuery, {
    fetchPolicy: 'no-cache',
    variables: {
      where
    },
    defaultSort: { id: 'asc' }
  });

  const [deleteRuleMutation] = useMutation(deleteRuleQuery);

  const toastRef = useRef<Toast>(null);

  const rules = loading ? previousData?.accounting_rules : data?.accounting_rules;
  const totalRecords = loading
    ? previousData?.accounting_rules_aggregate.aggregate.count
    : data?.accounting_rules_aggregate.aggregate.count;

  const [selectedRule, setSelectedRule] = useState<number | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  return (
    <>
      <Toast ref={toastRef} />
      <CreateRuleModal visible={showCreateModal} setVisible={setShowCreateModal} />
      <UpdateRuleModal ruleId={selectedRule} setRuleId={setSelectedRule} />

      <Row align="center" justify="between" px={2} pb={4}>
        <Row wrap>
          <InputTextDebounced
            icon="pi-search"
            placeholder="Search by"
            value={searchText}
            onChange={e => setSearchText(e)}
          />
          <CategoryDropdown value={selectedCategory} onChange={setSelectedCategory} />
        </Row>

        <Button label="Create Rule" icon="pi pi-plus" onClick={() => setShowCreateModal(true)} />
      </Row>
      <DataTable
        value={rules}
        dataKey="id"
        paginator
        lazy
        onPage={onPage}
        first={paginationValues.first}
        rows={paginationValues.rows}
        onSort={onPage}
        sortField={paginationValues.sortField}
        sortOrder={paginationValues.sortOrder}
        totalRecords={totalRecords}
        removableSort
        responsiveLayout="scroll"
        paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
        currentPageReportTemplate="Showing {first} to {last} of {totalRecords}"
        rowsPerPageOptions={[10, 25, 50, 100]}
        emptyMessage="No Rules found."
        data-cy="rules-table"
      >
        <Column selectionMode="multiple" headerStyle={{ width: '3rem' }}></Column>
        <Column field="name" header="Name" />
        <Column
          field="rule_type"
          header="Type"
          body={({ rule_type }) => transactionTypeTemplate(rule_type?.toLowerCase())}
          sortable
        />
        <Column field="transaction_regex" header="Regex" />
        <Column field="category.name" header="Category" />
        <Column
          field="category.is_business"
          header="Type"
          body={({ category }) => (
            <i className={`pi pi-${category?.is_business ? 'briefcase' : 'user'}`}></i>
          )}
        />
        <Column
          body={({ created_at }) => <span>{dateFormat(created_at)}</span>}
          field="created_at"
          header="Created At"
          sortable
        />
        <Column body={useActionButtons} />
      </DataTable>
    </>
  );

  function useActionButtons(data) {
    return (
      <Row wrap>
        <Button
          size="small"
          severity="info"
          tooltip="Edit"
          tooltipOptions={{ position: 'top' }}
          icon="pi pi-pencil"
          onClick={() => setSelectedRule(data.id)}
        />
        <Button
          size="small"
          severity="danger"
          tooltip="Delete"
          tooltipOptions={{ position: 'top' }}
          icon="pi pi-trash"
          onClick={() => deleteRule(data)}
        />
      </Row>
    );
  }

  async function deleteRule(data) {
    try {
      await deleteRuleMutation({
        variables: {
          id: data.id
        },
        refetchQueries: ['rules']
      });

      toastRef.current?.show({
        severity: 'success',
        summary: 'Success',
        detail: 'Rule deleted successfully',
        life: 3000
      });
    } catch (error: any) {
      toastRef.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: error.message,
        life: 3000
      });
    }
  }

  function transactionTypeTemplate(option) {
    return (
      <div className="flex align-items-center gap-2">
        {option === 'credit' ? (
          <i className="pi pi-arrow-up" style={{ color: 'green' }}></i>
        ) : (
          <i className="pi pi-arrow-down" style={{ color: 'red' }}></i>
        )}
        <div>{_.upperFirst(option)}</div>
      </div>
    );
  }
}
