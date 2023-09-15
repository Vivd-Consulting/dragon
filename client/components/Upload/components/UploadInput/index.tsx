import React, { useCallback, useEffect, useState } from 'react';
import { useQuery } from '@apollo/client';
import _ from 'lodash';
import cx from 'clsx';

import TooltipIcon from 'components/Tooltip';
import { Column, Row } from 'components/Group';
import { S3Image } from 'components/Image';

import { UploadButtonInput } from '../UploadButtonInput';

import mediaQuery from './media.gql';

import styles from './styles.module.sass';

type S3AssetProps = {
  fileId: number;
  isImage?: boolean;
  className?: string;
};

function S3Asset({ fileId, isImage, className }: S3AssetProps) {
  // Annoying re-query here, but it's cached anyway
  const { data } = useQuery(mediaQuery, {
    variables: {
      id: fileId
    },
    skip: !fileId
  });

  if (!fileId) {
    return null;
  }

  const { key, filename } = data?.media[0] || {};

  return isImage ? <S3Image s3Key={key} className={className} /> : <span>{filename}</span>;
}

export interface UploadInputInterface {
  name: string;
  label?: string;
  auto?: boolean;
  isRequired?: boolean;
  acceptType?: string;
  compression?: object;
  fullWidth?: boolean;
  formHook?: any;
  showDelete?: boolean;
  value?: any;
  tutorial?: any;
  className?: string;
  maxUploadSize?: number; //in bytes
  allowCommonsUpload?: boolean;
}

export const UploadInput = ({
  name,
  label = '',
  auto = true,
  isRequired = false,
  acceptType = '',
  compression,
  fullWidth,
  showDelete,
  formHook,
  value,
  tutorial,
  className,
  maxUploadSize,
  allowCommonsUpload
}: UploadInputInterface) => {
  const {
    formState: { errors },
    setError,
    clearErrors,
    register,
    setValue,
    getValues
  } = formHook;

  const [fileId, setFileId] = useState<number | undefined>(getValues(name));

  useEffect(() => {
    // On load, get the form value and set the imageId, GraphQL will load the cached query
    const value = getValues(name);

    if (value) {
      if (value?.id) {
        setFileId(value.id);
      } else {
        setFileId(value);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (fileId && setValue) {
      setValue(name, fileId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fileId]);

  useEffect(() => {
    if (value) {
      setFileId(value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const { data } = useQuery(mediaQuery, {
    variables: {
      id: fileId
    },
    skip: !fileId
  });

  const { id } = data?.media[0] || {};

  const getFormErrorMessage = () => {
    if (!errors) {
      return false;
    }

    const error = _.get(errors, name);

    return error && <small className="p-error">{error.message || `${label} is required`}</small>;
  };

  const fileError = getFormErrorMessage();

  const labelKlass = cx('p-label', styles.inputLabel, fileError && 'p-error');

  const isImage = acceptType.startsWith('image/');

  const tutorialIsFn = typeof tutorial === 'function';
  const tutorialKey = name.replace(/\./g, '-');

  const klass = cx(!fullWidth && styles.uploadImagePreview, className);

  const onUploadEnd = useCallback(() => {
    // TODO: This is an odd hack, not sure why clearing the error right after upload causes the new image not to display
    setTimeout(() => {
      clearErrors(name);
    }, 100);
  }, [name, clearErrors]);

  const onError = useCallback(
    message => {
      setError(name, {
        type: 'manual',
        message
      });
    },
    [name, setError]
  );

  console.log({
    fileId
  });

  return (
    <Column data-cy={`upload-${name}`}>
      {!!label && (
        <Row>
          <label htmlFor={name} className={labelKlass}>
            {isRequired && <span className="text-red-500">*</span>}
            {label}
          </label>

          {tutorial &&
            (tutorialIsFn ? (
              <TooltipIcon onClick={() => tutorial()} />
            ) : (
              <TooltipIcon tutorialKey={tutorialKey}>{tutorial}</TooltipIcon>
            ))}
        </Row>
      )}
      {fileId && <S3Asset fileId={fileId} isImage={isImage} className={klass} />}
      <UploadButtonInput
        onUpload={_onUpload}
        onUploadEnd={onUploadEnd}
        onError={onError}
        auto={auto}
        mediaId={id}
        acceptType={acceptType}
        compression={compression}
        onDelete={onDelete}
        showDelete={showDelete}
        maxUploadSize={maxUploadSize}
        allowCommonsUpload={allowCommonsUpload}
      />
      <input type="hidden" {...register(name, { required: isRequired })} />
      {fileError}
    </Column>
  );

  function onDelete() {
    setValue(name, null);
    setFileId(undefined);
  }

  function _onUpload(e) {
    const { response } = e;

    const id = response[0]?.id;

    if (id) {
      setFileId(id);
    }
  }
};
