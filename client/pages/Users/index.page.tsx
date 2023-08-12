import { Button } from 'primereact/button';

import Page from 'components/Page';
import { Row } from 'components/Group';
import { H2 } from 'components/Text';
import { InputTextDebounced } from 'components/Form';

import { Role } from 'types/roles';

import { useSearch } from 'hooks/useLocationSearch';

import UserList from './components/UserList';

import { CreateUserModal, InviteUserModal } from './components/UserForm';

const Users = () => {
  const [search, pushSearch] = useSearch();

  return (
    <>
      <H2>Users</H2>
      <Page>
        <Row justify="between" align="center" className="mb-3">
          <InputTextDebounced
            icon="pi-search"
            value={search}
            onChange={pushSearch}
            placeholder="Search Usernames"
            className="w-20rem"
          />

          <Row>
            <InviteUserModal
              trigger={
                <Button
                  label="Invite User"
                  type="button"
                  icon="pi pi-envelope"
                  className="p-button-secondary p-button-outlined"
                />
              }
            />
            <CreateUserModal
              trigger={<Button label="Add User" type="button" icon="pi pi-plus" />}
            />
          </Row>
        </Row>

        <UserList />
      </Page>
    </>
  );
};

Users.roles = [Role.Admin];

export default Users;
