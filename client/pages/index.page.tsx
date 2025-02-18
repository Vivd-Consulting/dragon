import { Column } from 'components/Group';

import { useAuth } from 'hooks/useAuth';

import { Role } from 'types/roles';

import AdminDash from './components/AdminDash';
// import UserDash from './components/UserDash';

import styles from './home.module.sass';

function Home() {
  const { isAdmin } = useAuth();

  return (
    <Column justify="between" align="center" fullHeight>
      {/* {isAdmin ? <AdminDash /> : <UserDash />} */}
      {isAdmin && <AdminDash />}

      <span className={styles.version}>Version 1.0a © 2023 Vivd.</span>
    </Column>
  );
}

Home.roles = [Role.Admin, Role.Contractor, Role.Client];

export default Home;
