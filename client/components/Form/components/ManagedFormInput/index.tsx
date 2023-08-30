import { useMemo } from 'react';
import { UseFormReturn } from 'react-hook-form';

import { UploadInput, UploadInputInterface, UploadImageInput } from 'components/Upload';

import {
  HiddenInputText,
  ImagePreview,
  InputCalendar,
  InputDropdown,
  InputMultiSelect,
  InputNumber,
  InputSwitch,
  InputText,
  InputTextArea
} from 'components/Form';

type ManagedFormInputsProps = {
  formHook: UseFormReturn;
};

export function ManagedFormInput({ formHook }: ManagedFormInputsProps) {
  const {
    control,
    formState: { errors },
    register
  } = formHook;

  // Memoize the form upload inputs, only ditch the state of the error state changes
  const components = useMemo(() => {
    const _UploadImageInput = ({ ...props }: UploadInputInterface) => {
      return <UploadImageInput {...props} formHook={formHook} />;
    };

    const _UploadFileInput = ({ ...props }: UploadInputInterface) => {
      return <UploadInput {...props} formHook={formHook} />;
    };

    const _InputTextArea = props => {
      return <InputTextArea controlProps={{ control, errors }} fullWidth {...props} />;
    };

    const _InputText = props => {
      return <InputText controlProps={{ control, errors }} fullWidth {...props} />;
    };

    const _InputNumber = props => {
      return <InputNumber controlProps={{ control, errors }} fullWidth {...props} />;
    };

    const _InputDropdown = props => {
      return <InputDropdown controlProps={{ control, errors }} fullWidth {...props} />;
    };

    const _InputSwitch = props => {
      return <InputSwitch controlProps={{ control, errors }} fullWidth {...props} />;
    };

    const _InputMultiSelect = props => {
      return <InputMultiSelect controlProps={{ control, errors }} fullWidth {...props} />;
    };

    const _InputCalendar = props => {
      return <InputCalendar controlProps={{ control, errors }} fullWidth {...props} />;
    };

    return {
      UploadImageInput: _UploadImageInput,
      UploadFileInput: _UploadFileInput,
      InputText: _InputText,
      InputTextArea: _InputTextArea,
      InputNumber: _InputNumber,
      InputDropdown: _InputDropdown,
      InputMultiSelect: _InputMultiSelect,
      InputSwitch: _InputSwitch,
      InputCalendar: _InputCalendar,
      ImagePreview,
      HiddenInputText
    };
  }, [formHook, control, errors]);

  return components;
}
