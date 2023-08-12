import cx from 'clsx';

import styles from './styles.module.sass';

const Spinner = () => {
  return <i className={cx(['pi', 'pi-spin', 'pi-spinner', styles.spinner])}></i>;
};

export default Spinner;
