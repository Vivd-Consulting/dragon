'use client';

import { useState, useEffect, useRef } from 'react';

import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';

import { Row } from '@/components/Group';
import CategoryDropdown from '@/components/CategoryDropdown';
import { InputTextDebounced } from '@/components/Form';

import { dateFormat } from '@/utils';
import { getRules, deleteRule } from '@/app/actions/accounting';
import { applyRules } from '@/app/actions/events';
import type { Rule } from '@/lib/knex/types';

import { CreateRuleModal, UpdateRuleModal } from './RuleModal';

export default function RulesList() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const [searchText, setSearchText] = useState<string | undefined>(undefined);
  const [selectedRule, setSelectedRule] = useState<number | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [applyRulesLoading, setApplyRulesLoading] = useState(false);

  const toastRef = useRef<Toast>(null);

  useEffect(() => {
    loadRules();
  }, [selectedCategory, searchText]);

  async function loadRules() {
    setLoading(true);
    try {
      const result = await getRules();

      if ('error' in result) {
        toastRef.current?.show({
          severity: 'error',
          summary: 'Error',
          detail: result.error,
          life: 3000,
        });
        return;
      }

      let filteredRules = result.data || [];

      if (selectedCategory) {
        filteredRules = filteredRules.filter((rule) => rule.gic_id === Number(selectedCategory));
      }

      if (searchText) {
        filteredRules = filteredRules.filter((rule) =>
          rule.name.toLowerCase().includes(searchText.toLowerCase())
        );
      }

      setRules(filteredRules);
    } catch (error) {
      toastRef.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load rules',
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteRule(data: Rule) {
    try {
      const result = await deleteRule(data.id);

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
        detail: 'Rule deleted successfully',
        life: 3000,
      });

      loadRules();
    } catch (error: any) {
      toastRef.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: error.message,
        life: 3000,
      });
    }
  }

  async function handleApplyRules() {
    setApplyRulesLoading(true);
    try {
      const result = await applyRules();

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
        detail: 'Rules applied successfully',
        life: 3000,
      });

      await loadRules();
    } catch (error) {
      toastRef.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'An error occurred while applying rules',
        life: 3000,
      });
    } finally {
      setApplyRulesLoading(false);
    }
  }

  function useActionButtons(data: Rule) {
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
          onClick={() => handleDeleteRule(data)}
        />
      </Row>
    );
  }

  function transactionTypeTemplate(ruleType: string) {
    return (
      <div className="flex align-items-center gap-2">
        {ruleType?.toLowerCase() === 'credit' ? (
          <i className="pi pi-arrow-up" style={{ color: 'green' }}></i>
        ) : (
          <i className="pi pi-arrow-down" style={{ color: 'red' }}></i>
        )}
        <div>{ruleType?.charAt(0).toUpperCase() + ruleType?.slice(1).toLowerCase()}</div>
      </div>
    );
  }

  return (
    <>
      <Toast ref={toastRef} />
      <CreateRuleModal
        visible={showCreateModal}
        setVisible={(v) => {
          setShowCreateModal(v);
          if (!v) {
            loadRules();
          }
        }}
      />
      <UpdateRuleModal
        ruleId={selectedRule}
        setRuleId={(id) => {
          setSelectedRule(id);
          if (!id) {
            loadRules();
          }
        }}
      />

      <Row align="center" justify="between" px={2} pb={4}>
        <Row wrap>
          <InputTextDebounced
            icon="pi-search"
            placeholder="Search by"
            value={searchText}
            onChange={(e) => setSearchText(e)}
          />
          <CategoryDropdown value={selectedCategory} onChange={setSelectedCategory} />
        </Row>

        <Row wrap>
          <Button
            label="Sync Transactions"
            icon="pi pi-refresh"
            severity="warning"
            onClick={handleApplyRules}
            loading={applyRulesLoading}
          />
          <Button label="Create Rule" icon="pi pi-plus" onClick={() => setShowCreateModal(true)} />
        </Row>
      </Row>
      <DataTable
        value={rules}
        dataKey="id"
        loading={loading}
        emptyMessage="No Rules found."
        data-cy="rules-table"
      >
        <Column field="name" header="Name" />
        <Column
          field="rule_type"
          header="Type"
          body={({ rule_type }: Rule) => transactionTypeTemplate(rule_type)}
        />
        <Column field="transaction_regex" header="Regex" />
        <Column
          body={({ created_at }: Rule) => <span>{dateFormat(created_at, true)}</span>}
          field="created_at"
          header="Created At"
        />
        <Column body={useActionButtons} />
      </DataTable>
    </>
  );
}
