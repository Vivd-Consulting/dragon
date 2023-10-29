import React, { useState } from 'react';

import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';

type modalProps = {
  header: string;
  trigger: JSX.Element;
  footer?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
};
export function Modal({ header, trigger, footer, className, children }: modalProps) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      {trigger && (
        <div onClick={() => setShowModal(true)} className={className}>
          {trigger}
        </div>
      )}
      <Dialog
        header={header}
        visible={showModal}
        className="w-20rem"
        onHide={onClose}
        footer={footer || <Button label="Close" onClick={onClose} className="p-button-secondary" />}
      >
        {children}
      </Dialog>
    </>
  );

  function onClose() {
    setShowModal(false);
  }
}

type ModalVisibleProps = {
  header: string;
  visible: boolean;
  footer?: React.ReactNode;
  onHide?: () => void;
  className?: string;
  children: React.ReactNode;
  style?: object;
};

export function ModalVisible({
  header,
  visible,
  footer,
  onHide,
  className,
  children,
  style
}: ModalVisibleProps) {
  return (
    <Dialog
      header={header}
      visible={visible}
      className={className}
      onHide={() => {
        onHide && onHide();
      }}
      footer={footer || <Button label="Close" onClick={onHide} className="p-button-secondary" />}
      dismissableMask
      /* eslint-disable-next-line react/forbid-component-props */
      style={style}
    >
      {children}
    </Dialog>
  );
}
