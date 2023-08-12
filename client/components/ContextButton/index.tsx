import React, { useRef } from 'react';
import { Button } from 'primereact/button';
import { ContextMenu } from 'primereact/contextmenu';

import styles from './styles.module.sass';

export default function ContextButton({ model }) {
  const cmRef = useRef<ContextMenu | null>(null);

  return (
    <>
      <ContextMenu model={model} ref={cmRef as React.RefObject<ContextMenu>} />
      <div className={styles.contextButton}>
        <Button
          className={styles.optionsButton}
          icon="pi pi-ellipsis-v"
          type="button"
          onClick={e => cmRef?.current?.show(e)}
        />
      </div>
    </>
  );
}
