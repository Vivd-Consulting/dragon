'use client';

import { useRef, useState, useEffect } from 'react';

import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';

import { FormFooterButtons, Form, InputText, InputDropdown } from '@/components/Form';

import { getRule, createRule, updateRule, getCategories, getAccounts, getTaxes } from '@/app/actions/accounting';

function RuleForm({ rule = {}, onSubmit, onError, onCancel }: any) {
  const [categories, setCategories] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [taxes, setTaxes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [categoriesResult, accountsResult, taxesResult] = await Promise.all([
          getCategories(),
          getAccounts(),
          getTaxes(),
        ]);

        if ('data' in categoriesResult) {
          setCategories(categoriesResult.data || []);
        }
        if ('data' in accountsResult) {
          setAccounts(accountsResult.data || []);
        }
        if ('data' in taxesResult) {
          setTaxes(taxesResult.data || []);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Form defaultValues={rule} onSubmit={_onSubmit} data-cy="rule-form">
      <InputText label="Name" name="name" isRequired />
      <InputDropdown label="Rule Type" name="rule_type" options={['DEBIT', 'CREDIT']} isRequired />
      <InputText label="Transaction Regex" name="transaction_regex" isRequired />
      <InputDropdown
        label="Account"
        name="account_id"
        placeholder="Select an Account"
        itemTemplate={accountDropdownTemplate}
        valueTemplate={accountDropdownValueTemplate}
        options={accounts}
        optionLabel="name"
        optionValue="id"
        showClear
      />
      <InputDropdown
        label="Tax"
        name="tax_id"
        placeholder="Select a Tax"
        options={taxes}
        optionLabel="name"
        optionValue="id"
        showClear
      />
      <InputDropdown
        label="Category"
        name="gic_id"
        placeholder="Select a Category"
        options={categories}
        optionLabel="name"
        optionValue="id"
        itemTemplate={categoryDropdownTemplate}
        valueTemplate={categoryDropdownValueTemplate}
        isRequired
      />

      <FormFooterButtons onCancel={onCancel} />
    </Form>
  );

  function categoryDropdownTemplate(option: any) {
    return (
      <div className="flex justify-content-start align-items-center gap-2">
        <i className={`pi ${option.is_business ? 'pi-briefcase' : 'pi-users'} p-mr-4`}></i>
        <span>{option.name}</span>
      </div>
    );
  }

  function categoryDropdownValueTemplate(option: any) {
    if (option) {
      return (
        <div className="flex justify-content-start align-items-center gap-2">
          <i className={`pi ${option.is_business ? 'pi-briefcase' : 'pi-users'} p-mr-2`}></i>
          <span>{option.name}</span>
        </div>
      );
    }
    return <span>Select a Category</span>;
  }

  function accountDropdownTemplate(option: any) {
    return (
      <div className="flex justify-content-start align-items-center gap-2">
        <i className={`pi ${option.is_business ? 'pi-briefcase' : 'pi-users'} p-mr-4`}></i>
        <span>{option.name}</span>
      </div>
    );
  }

  function accountDropdownValueTemplate(option: any) {
    if (option) {
      return (
        <div className="flex justify-content-start align-items-center gap-2">
          <i className={`pi ${option.is_business ? 'pi-briefcase' : 'pi-users'} p-mr-2`}></i>
          <span>{option.name}</span>
        </div>
      );
    }
    return <span>Select an Account</span>;
  }

  async function _onSubmit(data: any) {
    try {
      const rule_type = data.rule_type.toUpperCase();

      if (rule.id) {
        const result = await updateRule(rule.id, {
          ...data,
          rule_type: rule_type as 'CREDIT' | 'DEBIT',
        });

        if ('error' in result) {
          return onError(result);
        }

        return onSubmit(result);
      }

      const result = await createRule({
        ...data,
        rule_type: rule_type as 'CREDIT' | 'DEBIT',
      });

      if ('error' in result) {
        return onError(result);
      }

      return onSubmit(result);
    } catch (error: any) {
      return onError(error);
    }
  }
}

export function CreateRuleModal({ visible, setVisible }: { visible: boolean; setVisible: (v: boolean) => void }) {
  const toast = useRef<any>(null);

  return (
    <div className="card flex justify-content-center">
      <Toast ref={toast} />

      <Dialog header="Create Rule" visible={visible} style={{ width: '70vw' }} onHide={onHide}>
        <RuleForm onSubmit={onSubmit} onError={onError} onCancel={onHide} />
      </Dialog>
    </div>
  );

  async function onSubmit() {
    toast.current?.show({
      severity: 'success',
      summary: 'Success',
      detail: 'Rule added',
      life: 3000,
    });

    setVisible(false);
  }

  function onError(error: any) {
    toast.current?.show({
      severity: 'error',
      summary: 'Error',
      detail: error.message || error.error || 'Failed to create rule',
      life: 3000,
    });
  }

  function onHide() {
    setVisible(false);
  }
}

export function UpdateRuleModal({
  ruleId,
  setRuleId,
}: {
  ruleId: number | null;
  setRuleId: (id: number | null) => void;
}) {
  const [rule, setRule] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const toast = useRef<any>(null);

  useEffect(() => {
    async function loadRule() {
      if (!ruleId) {
        setRule(null);
        return;
      }

      setLoading(true);
      try {
        const result = await getRule(ruleId);

        if ('data' in result) {
          setRule(result.data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadRule();
  }, [ruleId]);

  return (
    <div className="card flex justify-content-center">
      <Toast ref={toast} />

      <Dialog header="Update Rule" visible={!!ruleId} style={{ width: '70vw' }} onHide={onHide}>
        {!loading && rule && (
          <RuleForm rule={rule} onSubmit={onSubmit} onError={onError} onCancel={onHide} />
        )}
      </Dialog>
    </div>
  );

  async function onSubmit() {
    toast.current?.show({
      severity: 'success',
      summary: 'Success',
      detail: 'Rule updated',
      life: 3000,
    });

    setRuleId(null);
  }

  function onError(error: any) {
    toast.current?.show({
      severity: 'error',
      summary: 'Error',
      detail: error.message || error.error || 'Failed to update rule',
      life: 3000,
    });
  }

  function onHide() {
    return setRuleId(null);
  }
}

