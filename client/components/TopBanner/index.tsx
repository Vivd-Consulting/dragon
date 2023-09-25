import { useState } from 'react';
import cx from 'clsx';
import { Sidebar as PSidebar } from 'primereact/sidebar';
import { Button } from 'primereact/button';

import Link from 'next/link';

import { Column, Row } from 'components/Group';
import { MobileSidebar } from 'components/Sidebar';

import styles from './styles.module.sass';

const mailto =
  'mailto:support@agentsofdiscovery.com?Subject=Mission%20Maker%20-%20Request%20for%20support';

export default function TopBanner() {
  const [visible, setVisible] = useState(false);
  const [mobileSidebarVisible, setMobileSidebarVisible] = useState(false);

  return (
    <>
      <PSidebar
        className="menu-sidebar"
        visible={mobileSidebarVisible}
        onHide={() => setMobileSidebarVisible(false)}
      >
        <MobileSidebar onItemClick={() => setMobileSidebarVisible(false)} />
      </PSidebar>
      <Row className={styles.topBanner} align="center" justify="start">
        <Button
          icon="pi pi-bars"
          className={cx(
            'p-button-rounded',
            'p-button-text',
            'p-button-plain',
            styles.hamburgerButton
          )}
          onClick={() => setMobileSidebarVisible(true)}
        />
        <Link href="/" className={styles.pageTitle}>
          Dragon Dash
        </Link>
      </Row>
      {visible && (
        <Column className={styles.dropdownContent}>
          <Row justify="end">
            <i className="pi pi-times cursor-pointer" onClick={toggleVisible} />
          </Row>
          <p className="m-0">
            Use the Help button at the bottom right of the screen to search our FAQ or live chat
            with a Customer Success Representative Mon-Fri between 9 am and 5:30 pm PST. If no one
            is available, you can send us a message, and we&apos;ll get back to you as soon as we
            can.
          </p>
        </Column>
      )}
    </>
  );

  function toggleVisible() {
    setVisible(!visible);
  }
}
