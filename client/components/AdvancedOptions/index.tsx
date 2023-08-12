import { Button } from 'primereact/button';
import cx from 'clsx';

import { Row, Column } from 'components/Group';

import styles from './styles.module.sass';

export default function AdvancedOptions({ expanded, setExpanded, children }) {
  const icon = cx('pi', expanded ? 'pi-chevron-up' : 'pi-chevron-down');
  const klass = cx(expanded ? styles.expanded : styles.collapsed);

  return (
    <Column>
      <Row align="center" justify="between">
        <h2>Map Advanced Options</h2>
        <Button
          icon={icon}
          className="p-button-rounded p-button-secondary p-button-text"
          aria-label="Expand"
          type="button"
          onClick={toggleExpanded}
        />
      </Row>
      <div className={klass}>{children}</div>
    </Column>
  );

  function toggleExpanded() {
    setExpanded(!expanded);
  }
}
