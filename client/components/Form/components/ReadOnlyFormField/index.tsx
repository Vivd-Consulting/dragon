import cx from 'clsx';

import { Row } from 'components/Group';
import TooltipIcon from 'components/Tooltip';

import styles from './styles.module.sass';

type ReadOnlyFormFieldProps = {
  label: string;
  subtitle?: string | null;
  isRequired?: boolean;
  fullWidth?: boolean;
  className?: string;
  errors?: string;
  tutorial?: string | (() => void) | JSX.Element;
  tutorialKey?: string;
  [key: string]: any;
};

export function ReadOnlyFormField({
  label,
  subtitle = null,
  isRequired = false,
  fullWidth = false,
  className = '',
  errors = '',
  tutorial,
  tutorialKey,
  children
}: ReadOnlyFormFieldProps) {
  const klass = cx('field', fullWidth && 'w-full', className);

  const tutorialIsFn = typeof tutorial === 'function';

  return (
    <div className={klass}>
      <Row className="mb-1">
        <>
          <label className={cx(styles.inputLabel, subtitle && 'mb-0')}>
            {isRequired && <span className="text-red-500">*</span>}
            {label}
          </label>
          {subtitle && (
            <>
              <br />
              <small>{subtitle}</small>
            </>
          )}
        </>
        {tutorial &&
          (tutorialIsFn ? (
            <TooltipIcon onClick={() => tutorial()} />
          ) : (
            <TooltipIcon tutorialKey={tutorialKey}>{tutorial}</TooltipIcon>
          ))}
      </Row>
      {errors && <small className="p-error block">{errors}</small>}
      {children}
    </div>
  );
}
