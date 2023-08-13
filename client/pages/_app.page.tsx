import '../styles/globals.css';
import 'primereact/resources/themes/lara-light-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';

import { Button } from 'primereact/button';
import { signOut } from 'next-auth/react';
import type { AppProps } from 'next/app';
import { SessionProvider } from 'next-auth/react';

import { ConfirmDialog } from 'primereact/confirmdialog';

import Head from 'next/head';

import { GqlAuthProvider, useAuth } from 'hooks/useAuth';

import { Column } from 'components/Group';
import { DesktopSidebar } from 'components/Sidebar';
import TopBanner from 'components/TopBanner';
import TermsOfService from 'components/TermsOfService';

import styles from './home.module.sass';

function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <SessionProvider session={session}>
      <Head>
        <title>Dragon Dash</title>
      </Head>

      <GqlAuthProvider>
        <RoleWrapper componentRole={(Component as any).roles}>
          <div className={styles['entire-page-grid']}>
            <TopBanner />
            <div className={styles['main-grid']}>
              <DesktopSidebar />
              <Column className={styles['main-page']}>
                <Component {...pageProps} />
              </Column>
            </div>
          </div>
        </RoleWrapper>
      </GqlAuthProvider>
      <ConfirmDialog />
    </SessionProvider>
  );
}

function RoleWrapper({ componentRole, children }) {
  const { dragonUser, role } = useAuth();

  console.log({
    logoutUrl: process.env.NEXT_PUBLIC_LOGOUT_URL
  });

  if (dragonUser && !dragonUser.is_enabled) {
    return (
      <div className="flex flex-column gap-4">
        <div className="pb-4">
          <h1>Account Unactivated</h1>
          <span>Your account has not been activated yet.</span>

          <Button
            label="Sign out"
            className="block"
            onClick={() =>
              signOut({
                callbackUrl: process.env.NEXT_PUBLIC_LOGOUT_URL
              })
            }
          />
        </div>
      </div>
    );
  }

  if (dragonUser && !dragonUser.accepted_tos) {
    return <TermsOfService />;
  }

  if (componentRole && !componentRole.includes(role)) {
    return (
      <div className="flex flex-column gap-4">
        <div className="pb-4">
          <h1>Unauthorized</h1>
          <span>You are not authorized to view this page.</span>

          <Button
            label="Sign out"
            className="block"
            onClick={() =>
              signOut({
                callbackUrl: process.env.NEXT_PUBLIC_LOGOUT_URL
              })
            }
          />
        </div>
      </div>
    );
  }

  return children;
}

export default App;
