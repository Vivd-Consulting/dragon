import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import Link from 'next/link';
import cx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/router';
import { signOut } from 'next-auth/react';
import { SplitButton } from 'primereact/splitbutton';

import { useAuth } from 'hooks/useAuth';

import { Row, Column } from 'components/Group';

import { Role } from 'types/roles';

import styles from './style.module.sass';

export const DesktopSidebar = () => {
  return (
    <div className={styles['desktop-sidebar']}>
      <div className={styles['desktop-sidebar-body']}>
        <SidebarContent />
      </div>
    </div>
  );
};

export const MobileSidebar = ({ onItemClick }) => {
  return (
    <div className={styles['mobile-sidebar']}>
      <SidebarContent onItemClick={onItemClick} />
    </div>
  );
};

type sidebarContentProps = {
  onItemClick?: () => void;
};
const SidebarContent = ({ onItemClick }: sidebarContentProps) => {
  const { user, isAdmin } = useAuth();

  const router = useRouter();
  const [selectedGroup, setSelectedGroup] = useState<SetStateAction<string | undefined | null>>();

  return (
    <>
      <Column align="center" className="gap-3 py-1">
        <Link href="/">
          <img src="/dragon_logo.png" alt="Dragon" className={styles['sidebar-logo']} />
        </Link>
        <a href="/" className={styles['sidebar-title']}>
          <h2 className="mt-0 mb-2">Dragon {isAdmin ? 'Admin' : 'Dash'}</h2>
        </a>
      </Column>

      <SplitButton
        label={user.email}
        size="small"
        icon="pi pi-user"
        id="user-profile"
        onClick={() => onSelectPath('/manage-account')}
        model={[
          {
            label: 'Manage Account',
            icon: 'pi pi-user',
            command: () => onSelectPath('/manage-account')
          },
          {
            label: 'Sign out',
            icon: 'pi pi-sign-out',
            command: () =>
              signOut({
                callbackUrl: process.env.NEXT_PUBLIC_LOGOUT_URL
              })
          }
        ]}
        className="mb-2"
      />

      <div className={styles['sidebar-items-container']}>
        <Column className={styles['sidebar-items']}>
          <SidebarItem
            icon="pi pi-home"
            label="Home"
            href="/"
            onClick={onItemClick}
            allowedRoles={[Role.Admin]}
          />

          <SidebarGroup
            icon="pi pi-briefcase"
            title="Clients"
            expanded={selectedGroup === 'Clients'}
            setExpanded={setSelectedGroup}
            allowedRoles={[Role.Admin]}
          >
            <SidebarItem
              label="Clients"
              href="/clients"
              onClick={onItemClick}
              allowedRoles={[Role.Admin]}
            />
            <SidebarItem
              label="Projects"
              href="/projects"
              onClick={onItemClick}
              allowedRoles={[Role.Admin]}
            />
          </SidebarGroup>

          <SidebarItem
            icon="pi pi-users"
            label="Contractors"
            href="/contractors"
            onClick={onItemClick}
            allowedRoles={[Role.Admin]}
          />

          <SidebarItem
            icon="pi pi-list"
            label="Tasks"
            href="/tasks"
            onClick={onItemClick}
            allowedRoles={[Role.Admin]}
          />

          <SidebarItem
            icon="pi pi-clock"
            label="Time Tracker"
            href="/time-tracker"
            onClick={onItemClick}
            allowedRoles={[Role.Admin, Role.Contractor]}
          />

          <SidebarGroup
            icon="pi pi-money-bill"
            title="Accounting"
            expanded={selectedGroup === 'Accounting'}
            setExpanded={setSelectedGroup}
            allowedRoles={[Role.Admin]}
          >
            <SidebarItem
              label="Invoices"
              href="/accounting/invoices"
              onClick={onItemClick}
              allowedRoles={[Role.Admin]}
            />
            <SidebarItem
              label="Reports"
              href="/accounting/reports"
              onClick={onItemClick}
              allowedRoles={[Role.Admin]}
            />
            <SidebarItem
              label="Banks"
              href="/accounting/banks"
              onClick={onItemClick}
              allowedRoles={[Role.Admin]}
            />
            <SidebarItem
              label="Transactions"
              href="/accounting/transactions"
              onClick={onItemClick}
              allowedRoles={[Role.Admin]}
            />
            <SidebarItem
              label="Rules"
              href="/accounting/rules"
              onClick={onItemClick}
              allowedRoles={[Role.Admin]}
            />
          </SidebarGroup>
        </Column>
      </div>
    </>
  );

  function onSelectPath(path) {
    router.push(path);

    onItemClick && onItemClick();
  }
};

// Icon should be changed to correct type, not any: WIP
const SidebarItem = ({
  allowedRoles,
  icon,
  label,
  href,
  external,
  onClick
}: {
  allowedRoles?: Role[];
  icon?: string;
  label: string;
  href: string;
  external?: boolean;
  onClick?: () => void;
}) => {
  const { role } = useAuth();
  const { asPath } = useRouter();

  if (!allowedRoles?.includes(role)) {
    return null;
  }

  const selected = href === '/' ? asPath === href : asPath.startsWith(href);
  const klass = cx(styles['sidebar-item'], selected && styles['selected']);

  if (external) {
    return (
      <a href={href} target="_blank" rel="noreferrer">
        <div className={cx(klass, 'flex', 'justify-content-between')}>
          <Row align="center" gap="3">
            {icon && <i className={icon} />}
            {label}
          </Row>
          <i className="pi pi-external-link text-sm"></i>
        </div>
      </a>
    );
  }

  return (
    <Link href={href}>
      <div className={klass} onClick={onClick}>
        <Row align="center" gap="3">
          {icon && <i className={icon} />}
          {label}
        </Row>
      </div>
    </Link>
  );
};

// Icon should be changed to correct type, not any: WIP
type sidebarGroupProps = {
  allowedRoles?: Role[];
  icon: any;
  title: string;
  expanded?: boolean;
  setExpanded: Dispatch<SetStateAction<string | undefined | null>>;
  children;
  onClick?: () => void;
};

const SidebarGroup = ({
  allowedRoles,
  icon,
  title,
  expanded,
  setExpanded,
  children
}: sidebarGroupProps) => {
  const { role } = useAuth();
  const { asPath } = useRouter();

  useEffect(() => {
    if (asPath.startsWith(`/${title}`)) {
      setExpanded(title);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!allowedRoles?.includes(role)) {
    return null;
  }

  const klass = cx(styles['sidebar-group'], styles['expandable']);

  const headerKlass = cx('flex', 'justify-content-between', styles['group-header']);

  return (
    <div className={klass}>
      <div className={headerKlass} onClick={toggleExpanded}>
        <a>
          <Row align="center" gap="3">
            {icon && <i className={icon} />}
            {title}
          </Row>
        </a>
        <SpinnyIcon />
      </div>

      <AnimatePresence initial={expanded}>
        {expanded && (
          <motion.div
            className={styles['group-children']}
            key="content"
            initial="collapsed"
            animate="open"
            exit="collapsed"
            variants={{
              open: { opacity: 1, height: 'auto' },
              collapsed: { opacity: 0, height: 0 }
            }}
            transition={{ duration: 0.25, ease: [0.04, 0.62, 0.23, 0.98] }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  function SpinnyIcon() {
    return (
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{
          type: 'tween',
          duration: 0.25
        }}
      >
        {expanded ? (
          <i className="pi pi-minus text-sm"></i>
        ) : (
          <i className="pi pi-plus text-sm"></i>
        )}
      </motion.div>
    );
  }

  function toggleExpanded() {
    setExpanded(expanded ? null : title);
  }
};
