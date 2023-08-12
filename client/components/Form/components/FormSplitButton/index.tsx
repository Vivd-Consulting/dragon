import { SplitButton } from 'primereact/splitbutton';

import { Row } from 'components/Group';

import styles from './styles.module.sass';

type FormSplitButtonProps = {
  justify?: 'start' | 'end' | 'center' | 'between' | 'around' | 'evenly';
  type?: 'button' | 'submit';
  items?: any[];
  [key: string]: any;
};
export function FormSplitButton({
  justify = 'start',
  type,
  items,
  ...props
}: FormSplitButtonProps) {
  return (
    <Row className={styles['right-button']} justify={justify}>
      <SplitButton model={items} {...props} />
    </Row>
  );
}
