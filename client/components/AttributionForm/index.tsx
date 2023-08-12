import { useQuery, useMutation } from '@apollo/client';
import { useForm } from 'react-hook-form';

import { CustomForm, FormFooterButtons } from 'components/Form';

import { Column } from 'components/Group';

import { VALIDATION_PATTERNS } from 'consts';

import attributionQuery from './queries/attribution.gql';
import updateAttributionQuery from './queries/updateAttribution.gql';

export const EditAttributionForm = ({ attributionId, onClose }) => {
  const { data: attributionData } = useQuery(attributionQuery, {
    variables: {
      id: attributionId
    },
    fetchPolicy: 'network-only'
  });

  const [updateAttribution] = useMutation(updateAttributionQuery);

  const attribution = attributionData?.attribution[0];

  if (!attribution) {
    return null;
  }

  const onSave = async data => {
    const { author, title, license, source_url } = data;

    await updateAttribution({
      variables: {
        id: attributionId,
        author,
        title,
        license,
        source_url
      }
    });

    onClose();
  };

  return <AttributionForm attribution={attribution} onSave={onSave} onClose={onClose} />;
};

export default function AttributionForm({ attribution, onSave, onClose }) {
  const formHook = useForm({ defaultValues: attribution });
  const { getValues, setError } = formHook;

  return (
    <CustomForm formHook={formHook} className="attribution-form">
      {({ InputText, InputDropdown }) => (
        <Column>
          <InputText name="author" label="Author" autoFocus />
          <InputText name="title" label="Title" />
          <InputDropdown
            name="license"
            label="License"
            options={[
              'NA',
              'CC_BY',
              'CC_BY_NC',
              'CC_BY_ND',
              'CC_BY_SA',
              'CC_BY_NC_SA',
              'CC_BY_NC_ND',
              'PD',
              'Copyright'
            ].map(value => ({ label: value, value }))}
            isRequired
          />
          <InputText
            name="source_url"
            label="Source URL"
            pattern={VALIDATION_PATTERNS.URL}
            onFailsValidation={() =>
              setError('source_url', {
                type: 'manual',
                message: 'Suspicious URL. Please use a different link.'
              })
            }
          />
          <FormFooterButtons onClick={() => onSave(getValues())} onCancel={onClose} />
        </Column>
      )}
    </CustomForm>
  );
}
