import { defaultCompression } from 'components/Upload/utils';
import { UploadInput, UploadInputInterface } from 'components/Upload';

export function UploadImageInput({
  name,
  label = '',
  auto = true,
  isRequired = false,
  acceptType = 'image/*',
  compression = defaultCompression,
  fullWidth,
  showDelete,
  formHook,
  value,
  tutorial,
  className,
  maxUploadSize,
  allowCommonsUpload
}: UploadInputInterface) {
  return UploadInput({
    name,
    label,
    auto,
    isRequired,
    acceptType,
    fullWidth,
    showDelete,
    compression,
    formHook,
    value,
    tutorial,
    className,
    maxUploadSize,
    allowCommonsUpload
  });
}
