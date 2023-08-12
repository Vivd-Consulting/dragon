import { Chips as PrimeChips } from 'primereact/chips';
import cx from 'clsx';

import { Column } from 'components/Group';

import styles from './styles.module.sass';

export default function Chips({ label = '', fullWidth = false, ...props }) {
  const klass = cx('chips', fullWidth && styles['full-width']);

  if (label) {
    return (
      <Column className={klass}>
        <label>{label}</label>
        <PrimeChips className={klass} {...props} />
      </Column>
    );
  }

  return (
    <div className={klass}>
      <PrimeChips {...props} />
    </div>
  );
}
