import { Button } from 'primereact/button';

import { Row } from 'components/Group';

import styles from './styles.module.sass';

type FormButtonProps = {
  justify?: 'start' | 'end' | 'center' | 'between' | 'around' | 'evenly';
  [key: string]: any;
};
export function FormButton({ justify = 'start', ...props }: FormButtonProps) {
  return (
    <Row className={styles['right-button']} justify={justify}>
      <Button {...props} />
    </Row>
  );
}
