import cx from 'clsx';

import styles from './styles.module.sass';

export const YesIcon = () => <i className={cx(['pi', 'pi-check-circle', styles.green])}></i>;
export const NoIcon = ({ red = false }) => (
  <i className={cx(['pi', 'pi-times-circle', red && styles.red])}></i>
);
