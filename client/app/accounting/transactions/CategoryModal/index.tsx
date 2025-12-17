'use client';

import { useEffect, useState, useRef } from 'react';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { InputText } from 'primereact/inputtext';
import { Checkbox } from 'primereact/checkbox';
import { RadioButton } from 'primereact/radiobutton';
import { Dropdown } from 'primereact/dropdown';

import { ModalVisible } from '@/components/Modal';
import { Column, Row } from '@/components/Group';
import CategoryDropdown from '../components/components/CategoryDropdown';
import AccountsDropdown from '../components/components/AccountsDropdown';

import { updateTransaction, createRule, getTaxes } from '@/app/actions/accounting';
import { applyRules } from '@/app/actions/events';

import useSelectedTransactions from '../hooks/useSelectedTransactions';
import useSWR from 'swr';

export default function CategoryModal({ refetchTransactions }: { refetchTransactions: () => void }) {
  const { transactions, type, setSelectedTransactions } = useSelectedTransactions();

  const [visible, setVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>(undefined);
  const [selectedTax, setSelectedTax] = useState<number | undefined>(undefined);
  const [createRuleChecked, setCreateRuleChecked] = useState(false);
  const [ruleName, setRuleName] = useState('');
  const [ruleTransactionRegex, setRuleTransactionRegex] = useState('');
  const [ruleApplyTo, setRuleApplyTo] = useState<'all' | 'uncategorized'>('uncategorized');
  const [taxes, setTaxes] = useState<any[]>([]);
  const [loadingTaxes, setLoadingTaxes] = useState(true);
  const [loading, setLoading] = useState(false);

  const toast = useRef<Toast>(null);

  const { mutate: mutateApplyRules } = useSWR('/api/events/transactions/apply-rules', async (url) => {
    const response = await fetch(url, { method: 'POST' });
    if (!response.ok) {
      throw new Error('Failed to apply rules');
    }
    return response.json();
  });

  useEffect(() => {
    if (transactions.length > 0) {
      setVisible(true);
      setSelectedCategory(undefined);
      setSelectedTax(undefined);
      setCreateRuleChecked(false);
      setRuleName('');
      setRuleTransactionRegex('');
      setRuleApplyTo('uncategorized');

      if (transactions.length === 1) {
        const transaction = transactions[0];
        setSelectedCategory(transaction.gic_category_id || undefined);
        setSelectedTax(transaction.tax_id || undefined);
        setRuleTransactionRegex(transaction.name || '');
        
        // Debug: log transaction data to help diagnose category filtering issues
        console.log('Transaction data:', {
          debit: transaction.debit,
          credit: transaction.credit,
          transaction_type: transaction.transaction_type,
          type: type,
        });
      }
    } else {
      setVisible(false);
    }
  }, [transactions, type]);

  useEffect(() => {
    async function loadTaxes() {
      setLoadingTaxes(true);
      try {
        const result = await getTaxes();
        if ('data' in result) {
          setTaxes(result.data || []);
        }
      } catch (error) {
        console.error('Error loading taxes:', error);
      } finally {
        setLoadingTaxes(false);
      }
    }
    loadTaxes();
  }, []);

  async function onSave() {
    if (!selectedCategory) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Please select a category.',
        life: 3000,
      });
      return;
    }

    setLoading(true);
    try {
      await Promise.all(
        transactions.map((transaction) =>
          updateTransaction(transaction.id, {
            gic_category_id: selectedCategory,
            tax_id: selectedTax,
          })
        )
      );

      if (createRuleChecked && ruleName && ruleTransactionRegex) {
        // Determine transaction type from actual transaction data (debit/credit), not personal/business
        const firstTransaction = transactions[0];
        const isDebit = firstTransaction?.debit !== null && 
                       firstTransaction?.debit !== undefined && 
                       firstTransaction?.debit !== 0;
        const transactionType = firstTransaction?.transaction_type || (isDebit ? 'debit' : 'credit');
        await createRule({
          name: ruleName,
          transaction_regex: ruleTransactionRegex,
          rule_type: transactionType === 'debit' ? 'DEBIT' : 'CREDIT',
          gic_id: selectedCategory,
          tax_id: selectedTax,
        });

        if (ruleApplyTo === 'all' || ruleApplyTo === 'uncategorized') {
          await mutateApplyRules();
        }
      }

      toast.current?.show({
        severity: 'success',
        summary: 'Success',
        detail: 'Transactions updated successfully.',
        life: 3000,
      });
      setVisible(false);
      setSelectedTransactions({ transactions: [], type: 'personal' }); // Empty array will reset to null in hook
      refetchTransactions();
    } catch (error: any) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: error.message || 'Failed to update transactions.',
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  }

  function onHide() {
    setVisible(false);
    setSelectedTransactions({ transactions: [], type: 'personal' }); // Empty array will reset to null in hook
  }

  const footer = (
    <Row justify="end" gap="2">
      <Button label="Cancel" icon="pi pi-times" onClick={onHide} className="p-button-text" disabled={loading} />
      <Button label="Save" icon="pi pi-check" onClick={onSave} loading={loading} />
    </Row>
  );

  return (
    <ModalVisible header="Categorize Transactions" visible={visible} onHide={onHide} footer={footer}>
      <Toast ref={toast} />
      <Column gap="3">
        <CategoryDropdown
          value={selectedCategory}
          onChange={setSelectedCategory}
          transactionType={
            transactions[0]?.transaction_type ||
            ((transactions[0]?.debit !== null && transactions[0]?.debit !== undefined && transactions[0]?.debit !== 0) 
              ? 'debit' 
              : 'credit')
          }
          isBusiness={type === 'business' ? true : type === 'personal' ? false : undefined}
        />

        {transactions.length === 1 && (
          <AccountsDropdown
            value={transactions[0].account_id}
            onChange={() => {}}
          />
        )}

        <Dropdown
          options={taxes}
          optionLabel="name"
          optionValue="id"
          placeholder="Select Tax"
          filter
          showClear
          value={selectedTax}
          onChange={(e) => setSelectedTax(e.value)}
          disabled={loadingTaxes}
        />

        <Row align="center" gap="2">
          <Checkbox
            inputId="createRule"
            checked={createRuleChecked}
            onChange={(e) => setCreateRuleChecked(e.checked || false)}
          />
          <label htmlFor="createRule">Create Rule</label>
        </Row>

        {createRuleChecked && (
          <Column gap="2">
            <InputText
              value={ruleName}
              onChange={(e) => setRuleName(e.target.value)}
              placeholder="Rule Name"
            />
            <InputText
              value={ruleTransactionRegex}
              onChange={(e) => setRuleTransactionRegex(e.target.value)}
              placeholder="Transaction Regex"
            />
            <Row gap="2">
              <RadioButton
                inputId="ruleApplyToAll"
                name="ruleApplyTo"
                value="all"
                onChange={(e) => setRuleApplyTo(e.value)}
                checked={ruleApplyTo === 'all'}
              />
              <label htmlFor="ruleApplyToAll">Apply to all matching transactions</label>
            </Row>
            <Row gap="2">
              <RadioButton
                inputId="ruleApplyToUncategorized"
                name="ruleApplyTo"
                value="uncategorized"
                onChange={(e) => setRuleApplyTo(e.value)}
                checked={ruleApplyTo === 'uncategorized'}
              />
              <label htmlFor="ruleApplyToUncategorized">Apply to uncategorized matching transactions</label>
            </Row>
          </Column>
        )}
      </Column>
    </ModalVisible>
  );
}
