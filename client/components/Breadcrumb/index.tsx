import { useRouter } from 'next/router';
import Link from 'next/link';
import cx from 'clsx';

import { BreadCrumb } from 'primereact/breadcrumb';

import styles from './styles.module.sass';

const breadcrumbMap = {
  ManageAccount: 'Manage Account',
  MyChallenges: 'My Challenges',
  ArCatchTypes: 'AR Catch Types',
  FieldAgents: 'Field Agents',
  IrModels: 'IR Models',
  RegionUIs: 'Region UIs',
  RewardTemplates: 'Reward Templates'
};

export default function Breadcrumb({ thisPage }: { thisPage?: string }) {
  const router = useRouter();

  const { asPath } = router;

  const homeKlass = cx('p-menuitem-icon', 'pi', 'pi-home', styles['link']);

  const home = { icon: 'pi pi-home', template: <a className={homeKlass}></a> };

  const paths = asPath.split('/').slice(1);

  const items = paths.map((p, i) => {
    const url = `/${paths.slice(0, i + 1).join('/')}`;

    if (thisPage && i === paths.length - 1) {
      return { label: thisPage };
    }

    const itemName = p.split('?')[0];

    return {
      template: (
        <Link href={url} className={styles['link']}>
          {breadcrumbMap[itemName] || itemName}
        </Link>
      )
    };
  });

  return <BreadCrumb model={items} home={home} className="mb-2" />;
}
