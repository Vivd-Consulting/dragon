import styles from './styles.module.sass';

export function H2({ children }) {
  return <h2 className={styles['h2']}>{children}</h2>;
}
