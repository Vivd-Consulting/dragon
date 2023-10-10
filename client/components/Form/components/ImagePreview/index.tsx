import { UseFormReturn } from 'react-hook-form';

import { ImageFromId } from 'components/Image';
import { FormField } from 'components/Form';

type ImagePreviewProps = {
  name: string;
  label: string;
  formHook?: any;
  tutorial?: string;
  className?: string;
};

export function ImagePreview({ name, label, formHook, tutorial, className }: ImagePreviewProps) {
  const { control } = formHook;

  return (
    <FormField label={label} name={name} control={control} tutorial={tutorial}>
      {() => (
        <>
          <br />
          <ImageFromId id={name} className={className} />
        </>
      )}
    </FormField>
  );
}
