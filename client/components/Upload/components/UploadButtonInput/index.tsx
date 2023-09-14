import React, { useRef, useState } from 'react';
import cx from 'clsx';
import Compressor from 'compressorjs';
import { confirmDialog } from 'primereact/confirmdialog';
import { FileUpload } from 'primereact/fileupload';
import { ContextMenu } from 'primereact/contextmenu';
import { Button } from 'primereact/button';
import { MenuItem } from 'primereact/menuitem';

import { useAuth } from 'hooks/useAuth';

import { ACCEPTED_TYPES } from 'consts';

import styles from './styles.module.sass';

type UploadButtonInputProps = {
  onUpload: (args: { response: any }) => void;
  onUploadStart?: () => void;
  onUploadEnd?: () => void;
  onError: (error: string) => void;
  onDelete: () => void;
  showDelete?: boolean;
  acceptType: string;
  auto?: boolean;
  mediaId?: string;
  compression?: {
    quality?: number;
    maxWidth?: number;
    maxHeight?: number;
  };
  maxUploadSize?: number;
  allowCommonsUpload?: boolean;
};

export const UploadButtonInput = ({
  onUpload,
  onUploadStart,
  onUploadEnd,
  onError,
  onDelete,
  showDelete = true,
  acceptType,
  auto = false,
  mediaId,
  compression,
  maxUploadSize
}: UploadButtonInputProps) => {
  const fileUploadRef = useRef(null);
  const { token } = useAuth();

  const cmRef = useRef<ContextMenu | null>(null);

  const [uploading, setUploading] = useState(false);

  const confirmDelete = () =>
    confirmDialog({
      message: 'Are you sure you want to delete?',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: onDelete
    });

  const buttonModel = [
    showDelete && {
      label: 'Delete',
      icon: 'pi pi-fw pi-trash',
      command: () => confirmDelete()
    }
  ].filter(Boolean) as MenuItem[]; // Type assertion to MenuItem[] // Filter out any null values from the array

  // const acceptsImageOrSound = ACCEPTED_TYPES['image_or_audio'].test(acceptType);
  const hasMedia = !!mediaId;

  return (
    <div className={cx(styles.uploadInput, hasMedia && styles.noRightBorder)}>
      <FileUpload
        ref={fileUploadRef}
        mode="basic"
        name="files"
        auto={auto}
        accept={acceptType}
        uploadHandler={customUpload}
        className={styles.uploadButton}
        customUpload
        disabled={uploading}
      />
      {hasMedia && (
        <>
          <ContextMenu model={buttonModel} ref={cmRef as React.RefObject<ContextMenu>} />
          <Button
            className={styles.optionsButton}
            icon="pi pi-ellipsis-v"
            type="button"
            onClick={e => cmRef?.current?.show(e)}
            disabled={uploading}
          />
        </>
      )}
    </div>
  );

  async function customUpload(e) {
    const compress = file =>
      new Promise((resolve, reject) => {
        // TODO: Fiddle with these until we have a good balance of quality and size
        return new Compressor(file, {
          ...compression,
          success: compressedResult => resolve(compressedResult),
          error: err => reject(err)
        });
      });

    if (onUploadStart) {
      onUploadStart();
    }

    let file = e.files[0];

    // Check if the file type matches our Regex
    if (!ACCEPTED_TYPES[acceptType].test(file.type)) {
      onError('Invalid file type');

      e.options.clear();
      return;
    }

    // Check if the file is too large
    if (!!maxUploadSize && file.size > maxUploadSize) {
      onError('File is too large');

      e.options.clear(); //previous upload name is still displayed...
      return;
    }

    setUploading(true);

    if (compression) {
      file = await compress(e.files[0]);
    }

    const formData = new FormData();

    formData.append('files', file);

    await uploadImage(formData);

    e.options.clear();

    setUploading(false);

    if (onUploadEnd) {
      onUploadEnd();
    }
  }

  async function uploadImage(formData) {
    const headers: HeadersInit = {
      Authorization: `Bearer ${token}`
    };

    const uploadTarget = `${process.env.NEXT_PUBLIC_API_HOST}/storage/upload`;

    const req = await fetch(uploadTarget, {
      method: 'POST',
      headers,
      body: formData
    });

    const response = await req.json();

    await onUpload({ response });
  }
};
