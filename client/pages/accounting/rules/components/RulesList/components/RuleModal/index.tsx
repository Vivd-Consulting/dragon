import { useRef } from 'react';
import { useQuery, useMutation } from '@apollo/client';

import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';

import { FormFooterButtons, Form, InputText, InputDropdown } from 'components/Form';

import createRuleMutation from './queries/createRule.gql';
import updateRuleMutation from './queries/updateRule.gql';

import getRuleQuery from './queries/getRule.gql';
import categoriesQuery from './queries/categories.gql';
import accountsQuery from './queries/accounts.gql';
import taxesQuery from './queries/taxes.gql';

function RuleForm({ rule = {}, onSubmit, onError, onCancel }: any) {
  const { data: categoriesData } = useQuery(categoriesQuery);
  const { data: accountsData } = useQuery(accountsQuery);
  const { data: taxesData } = useQuery(taxesQuery);

  const categories = categoriesData?.accounting_category;
  const accounts = accountsData?.accounting_account;
  const taxes = taxesData?.accounting_tax;

  const [createRule] = useMutation(createRuleMutation, {
    refetchQueries: ['rule', 'rules']
  });

  const [updateRule] = useMutation(updateRuleMutation, {
    refetchQueries: ['rule', 'rules']
  });

  return (
    <Form defaultValues={rule} onSubmit={_onSubmit} data-cy="rule-form">
      <InputText label="Name" name="name" isRequired />
      <InputDropdown label="Rule Type" name="rule_type" options={['DEBIT', 'CREDIT']} isRequired />
      <InputText label="Transaction Regex" name="transaction_regex" isRequired />
      <InputDropdown
        label="Account"
        name="account_id"
        placeholder="Select an Account"
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

  function categoryDropdownTemplate(option) {
    return (
      <div className="flex justify-content-start align-items-center gap-2">
        <i className={`pi ${option.is_business ? 'pi-briefcase' : 'pi-users'} p-mr-4`}></i>
        <span>{option.name}</span>
      </div>
    );
  }

  function categoryDropdownValueTemplate(option) {
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

  function _onSubmit(data) {
    return new Promise(async resolve => {
      const rule_type = data.rule_type.toUpperCase();

      if (rule.id) {
        try {
          const update = await updateRule({
            variables: {
              id: rule.id,
              ...data,
              rule_type
            }
          });

          return onSubmit(update);
        } catch (error: any) {
          console.error(error);
          return onError(error);
        } finally {
          resolve(true);
        }
      }

      try {
        const create = await createRule({
          variables: {
            ...data,
            rule_type
          }
        });

        return onSubmit(create);
      } catch (error: any) {
        return onError(error);
      } finally {
        resolve(true);
      }
    });
  }
}

export function CreateRuleModal({ visible, setVisible }) {
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
    toast?.current?.show({
      severity: 'success',
      summary: 'Success',
      detail: 'Rule added',
      life: 3000
    });

    setVisible(false);
  }

  function onError(error) {
    toast?.current?.show({
      severity: 'error',
      summary: 'Error',
      detail: error.message,
      life: 3000
    });
  }

  function onHide() {
    setVisible(false);
  }
}

export function UpdateRuleModal({ ruleId, setRuleId }) {
  const { data, loading } = useQuery(getRuleQuery, {
    variables: { id: ruleId },
    skip: !ruleId
  });

  const toast = useRef<any>(null);

  return (
    <div className="card flex justify-content-center">
      <Toast ref={toast} />

      <Dialog header="Update Rule" visible={!!ruleId} style={{ width: '70vw' }} onHide={onHide}>
        {!loading && data && (
          <RuleForm
            rule={data.accounting_rules_by_pk}
            onSubmit={onSubmit}
            onError={onError}
            onCancel={onHide}
          />
        )}
      </Dialog>
    </div>
  );

  async function onSubmit() {
    toast?.current?.show({
      severity: 'success',
      summary: 'Success',
      detail: 'Rule updated',
      life: 3000
    });

    setRuleId(null);
  }

  function onError(error) {
    toast?.current?.show({
      severity: 'error',
      summary: 'Error',
      detail: error.message,
      life: 3000
    });
  }

  function onHide() {
    return setRuleId(null);
  }
}
