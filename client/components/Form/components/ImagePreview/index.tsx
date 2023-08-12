import { UseFormReturn } from 'react-hook-form';

import { ImageFromId } from 'components/Image';
import { FormField } from 'components/Form';

type ImagePreviewProps = {
  name: string;
  label: string;
  controlProps: UseFormReturn<{}, any>;
  tutorial?: string;
  className?: string;
};

export function ImagePreview({
  name,
  label,
  controlProps,
  tutorial,
  className
}: ImagePreviewProps) {
  const { control } = controlProps;

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
