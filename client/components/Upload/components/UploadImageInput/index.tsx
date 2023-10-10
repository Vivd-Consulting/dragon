import { defaultCompression } from 'components/Upload/utils';
import { UploadFileInput, UploadInputProps } from 'components/Upload';

export function UploadImageInput({
  name,
  label = '',
  auto = true,
  isRequired = false,
  acceptType = 'image/*',
  disabled,
  compression = defaultCompression,
  fullWidth,
  showDelete,
  formHook,
  value,
  tutorial,
  className,
  maxUploadSize,
  allowCommonsUpload
}: UploadInputProps) {
  return UploadFileInput({
    name,
    label,
    auto,
    isRequired,
    acceptType,
    disabled,
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
