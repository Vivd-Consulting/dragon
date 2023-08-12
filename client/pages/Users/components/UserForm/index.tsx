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

import userQuery from './queries/user.gql';

import createUserQuery from './queries/createUser.gql';
import inviteUserQuery from './queries/inviteUser.gql';

import styles from './styles.module.sass';

export function ViewUserModal({ user, trigger }) {
  const { data } = useQueryOnce(userQuery, {
    fetchPolicy: 'no-cache',
    variables: {
      id: user.auth_0_id
    }
  });

  const [showModal, setShowModal] = useState(false);

  if (!data) {
    return null;
  }

  let [userData] = data.dragon_user;
  const { userRole } = data;

  const rolesMap = {
    admin: 'Admin',
    user: 'User'
  };

  return (
    <>
      {trigger && <div onClick={() => setShowModal(true)}>{trigger}</div>}
      <Dialog
        header={`Viewing ${userData?.name}`}
        visible={showModal}
        className={styles['view-user-modal']}
        onHide={onClose}
      >
        <p>
          <strong>Name: </strong>
          {userData.name}
        </p>
        <p>
          <strong>Email: </strong>
          {userData.email}
        </p>
        <p>
          <strong>Role: </strong>
          {rolesMap[userRole]}
        </p>

        <a
          href="https://test.com"
          target="_blank"
          className={styles['external-link']}
          rel="noreferrer"
        >
          {userData.id}
          <i className="pi pi-external-link ml-2"></i>
        </a>

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

export function CreateUserModal({ trigger }) {
  const [createUser] = useMutation(createUserQuery, {
    refetchQueries: ['dragon_user']
  });
  const [showModal, setShowModal] = useState(false);

  const toastRef = useRef<Toast>(null);

  return (
    <>
      <Toast ref={toastRef} />
      {trigger && <div onClick={() => setShowModal(true)}>{trigger}</div>}
      <Dialog
        header="Create User"
        visible={showModal}
        className={styles['create-user-modal']}
        onHide={onClose}
      >
        <UserForm onSubmit={onSubmit} onClose={onClose} choosePassword />
      </Dialog>
    </>
  );

  async function onSubmit(data) {
    const { name, email, password, role } = sanitize(data);

    try {
      await createUser({
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
        summary: 'Failed to Create User',
        detail: 'Confirm the password is strong, and a user with this email does not already exist.'
      });
      console.error(e);
    }
  }

  function onClose() {
    setShowModal(false);
  }
}

export function InviteUserModal({ trigger }) {
  const [showModal, setShowModal] = useState(false);
  const [inviteUser] = useMutation(inviteUserQuery, {
    refetchQueries: ['dragon_user']
  });

  const toastRef = useRef<Toast>(null);

  return (
    <>
      <Toast ref={toastRef} />
      {trigger && <div onClick={() => setShowModal(true)}>{trigger}</div>}
      <Dialog
        header="Invite User"
        visible={showModal}
        className={styles['invite-user-modal']}
        onHide={onClose}
      >
        <UserForm onSubmit={onSubmit} onClose={onClose} />
      </Dialog>
    </>
  );

  async function onSubmit(data) {
    const { name, email, role } = sanitize(data);

    try {
      await inviteUser({
        variables: {
          name,
          email,
          role
        }
      });

      onClose();
    } catch (e) {
      toastRef?.current?.show({
        life: 5000,
        severity: 'error',
        summary: 'Failed to Invite User',
        detail: 'Confirm a user with this email does not already exist.'
      });
      console.error(e);
    }
  }

  function onClose() {
    setShowModal(false);
  }
}

interface User {
  id?: string;
  role?: any;
}

function UserForm({ user = {} as User, onSubmit, onClose, choosePassword = false }) {
  const { role: _role } = useAuth();

  const isAdmin = _role >= Role.User;

  const formHook: UseFormReturn<FieldValues, any> = useForm({ defaultValues: user });
  const { setValue } = formHook as {
    setValue: UseFormSetValue<FieldValues>;
  };

  const baseRoles = [{ label: 'User', value: 'user' }];

  const roles = isAdmin ? [{ label: 'Admin', value: 'admin' }, ...baseRoles] : baseRoles;

  const [role, setRole] = useState(user?.role);

  const memoizedSetRole = useCallback(() => {
    setValue('role', role);
  }, [setValue, role]);

  useEffect(() => {
    memoizedSetRole();
  }, [memoizedSetRole]);

  return (
    <CustomForm formHook={formHook} onSubmit={onSubmit}>
      {({ InputText, InputDropdown }) => (
        <>
          <InputText label="Name" name="name" isRequired autoFocus />
          <InputText label="Email" name="email" pattern={VALIDATION_PATTERNS} isRequired />
          {choosePassword && <InputText label="Password" name="password" isPassword isRequired />}
          <InputDropdown
            label="Role"
            name="role"
            isRequired
            options={roles}
            onChange={({ value }) => setRole(value)}
          />

          <FormFooterButtons onSubmit={onSubmit} onCancel={onClose} />
        </>
      )}
    </CustomForm>
  );
}
