import '../styles/globals.css';
import '../styles/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';

import { Column } from '@/components/Group';
import { DesktopSidebar } from '@/components/Sidebar';
import TopBanner from '@/components/TopBanner';
import { ClientProviders } from '@/components/ClientProviders';

import styles from './home.module.sass';

export const metadata = {
  title: 'Dragon Dash',
  description: 'Dragon Dash Application',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ClientProviders>
          <div className={styles['entire-page-grid']}>
            <TopBanner />
            <div className={styles['main-grid']}>
              <DesktopSidebar />
              <Column className={styles['main-page']}>
                {children}
              </Column>
            </div>
          </div>
        </ClientProviders>
      </body>
    </html>
  );
}

