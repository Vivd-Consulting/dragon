import { useCallback, useEffect, useState, useRef } from 'react';
import { useMutation } from '@apollo/client';
import { FieldValues, useForm, UseFormReturn, UseFormSetValue } from 'react-hook-form';

import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';

import { sanitize } from 'utils';

import { useAuth } from 'hooks/useAuth';
import { useQueryOnce } from 'hooks/useQuery';

import { Role } from 'types/roles';

import { CustomForm, FormFooterButtons } from 'components/Form';
import { Row } from 'components/Group';

import { VALIDATION_PATTERNS } from 'consts';

import {{LOWER}}Query from './queries/{{LOWER}}.gql';

import create{{FUPPER}}Query from './queries/create{{FUPPER}}.gql';

import styles from './styles.module.sass';

export function View{{FUPPER}}Modal({ {{LOWER}}, trigger }) {
  const { data } = useQueryOnce({{LOWER}}Query, {
    fetchPolicy: 'no-cache',
    variables: {
      id: {{LOWER}}.id
    }
  });

  const [showModal, setShowModal] = useState(false);

  if (!data) {
    return null;
  }

  let [{{LOWER}}Data] = data.{{QUERYNAME}};

  const rolesMap = {
    admin: 'Admin',
    {{LOWER}}: '{{FUPPER}}'
  };

  return (
    <>
      {trigger && <div onClick={() => setShowModal(true)}>{trigger}</div>}
      <Dialog
        header={`Viewing ${{{LOWER}}Data?.name}`}
        visible={showModal}
        className={styles['view-{{LOWER}}-modal']}
        onHide={onClose}
      >
        <p>
          <strong>Name: </strong>
          {{{LOWER}}Data.name}
        </p>

        <Row justify="end">
          <Button
            type="button"
            label="Close"
            onClick={onClose}
            icon="pi pi-check"
            className="p-button-outlined p-button-secondary"
          />
        </Row>
      </Dialog>
    </>
  );

  function onClose() {
    setShowModal(false);
  }
}

export function Create{{FUPPER}}Modal({ trigger }) {
  const [create{{FUPPER}}] = useMutation(create{{FUPPER}}Query, {
    refetchQueries: ['{{QUERYNAME}}']
  });
  const [showModal, setShowModal] = useState(false);

  const toastRef = useRef<Toast>(null);

  return (
    <>
      <Toast ref={toastRef} />
      {trigger && <div onClick={() => setShowModal(true)}>{trigger}</div>}
      <Dialog
        header="Create {{FUPPER}}"
        visible={showModal}
        className={styles['create-{{LOWER}}-modal']}
        onHide={onClose}
      >
        <{{FUPPER}}Form onSubmit={onSubmit} onClose={onClose} choosePassword />
      </Dialog>
    </>
  );

  async function onSubmit(data) {
    const { name, email, password, role } = sanitize(data);

    try {
      await create{{FUPPER}}({
        variables: {
          name,
          email,
          password,
          role
        }
      });

      onClose();
    } catch (e) {
      toastRef?.current?.show({
        life: 5000,
        severity: 'error',
        summary: 'Failed to Create {{FUPPER}}',
        detail: e.message
      });
      console.error(e);
    }
  }

  function onClose() {
    setShowModal(false);
  }
}

interface {{FUPPER}} {
  id?: string;
}

function {{FUPPER}}Form({ {{LOWER}} = {} as {{FUPPER}}, onSubmit, onClose, choosePassword = false }) {
  const { role: _role } = useAuth();

  const isAdmin = _role >= Role.{{FUPPER}};

  const formHook: UseFormReturn<FieldValues, any> = useForm({ defaultValues: {{LOWER}} });
  const { setValue } = formHook as {
    setValue: UseFormSetValue<FieldValues>;
  };

  return (
    <CustomForm formHook={formHook} onSubmit={onSubmit}>
      {({ InputText }) => (
        <>
          <InputText label="Name" name="name" isRequired autoFocus />
          {/* ... */}
          <FormFooterButtons onSubmit={onSubmit} onCancel={onClose} />
        </>
      )}
    </CustomForm>
  );
}
