import { Row } from 'components/Group';
import { FormSplitButton } from 'components/Form/components/FormSplitButton';
import { FormButton } from 'components/Form/components/FormButton';

import { useNavigate } from 'hooks/useNavigate';

type FormFooterButtonsProps = {
  justify?: 'start' | 'end' | 'center' | 'between' | 'around' | 'evenly';
  items?: any[];
  onClick?: ((e: any) => void) | null;
  onCancel?: (() => void) | null;
  [key: string]: any;
};
export function FormFooterButtons({
  justify = 'end',
  items = [],
  loading = false,
  hideCancel = false,
  submitText = 'Submit',
  onClick = null,
  onCancel = null,
  ...props
}: FormFooterButtonsProps) {
  const { goUp } = useNavigate();

  const hasItems = items.length > 0;

  return (
    <Row justify={justify} {...props}>
      {!hideCancel && (
        <FormButton
          type="button"
          loading={loading}
          label="Cancel"
          icon="pi pi-times"
          className="p-button-secondary"
          onClick={() => (onCancel ? onCancel() : goUp())}
          data-cy="form-cancel"
        />
      )}
      {!hasItems ? (
        <FormButton
          type={onClick ? 'button' : 'submit'}
          loading={loading}
          onClick={e => onClick && onClick(e)}
          label={submitText}
          icon="pi pi-check"
          data-cy="submit-button"
        />
      ) : (
        <FormSplitButton
          type={onClick ? 'button' : 'submit'}
          loading={loading}
          onClick={e => onClick && onClick(e)}
          label={submitText}
          icon="pi pi-check"
          items={items}
          data-cy="submit-button"
        />
      )}
    </Row>
  );
}
