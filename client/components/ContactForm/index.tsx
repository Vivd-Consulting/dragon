import { useState } from 'react';

import { Column } from 'components/Group';

import { VALIDATION_PATTERNS } from 'consts';

export default function ContactForm({ defaultCountry = null, InputText, InputDropdown }) {
  const [selectedCountry, setSelectedCountry] = useState(defaultCountry || 'United States');
  const isUSA = selectedCountry === 'United States';

  const countries = [
    { value: 'United States', label: 'United States' },
    { value: 'Canada', label: 'Canada' },
    { value: 'Mexico', label: 'Mexico' },
    // TODO: Add more countries
    { value: 'Other', label: 'Other' }
  ];

  const proviceStates = {
    'United States': [
      'Alabama',
      'Alaska',
      'Arizona',
      'Arkansas',
      'California',
      'Colorado',
      'Connecticut',
      'Delaware',
      'Florida',
      'Georgia',
      'Hawaii',
      'Idaho',
      'Illinois',
      'Indiana',
      'Iowa',
      'Kansas',
      'Kentucky',
      'Louisiana',
      'Maine',
      'Maryland',
      'Massachusetts',
      'Michigan',
      'Minnesota',
      'Mississippi',
      'Missouri',
      'Montana',
      'Nebraska',
      'Nevada',
      'New Hampshire',
      'New Jersey',
      'New Mexico',
      'New York',
      'North Carolina',
      'North Dakota',
      'Ohio',
      'Oklahoma',
      'Oregon',
      'Pennsylvania',
      'Rhode Island',
      'South Carolina',
      'South Dakota',
      'Tennessee',
      'Texas',
      'Utah',
      'Vermont',
      'Virginia',
      'Washington',
      'West Virginia',
      'Wisconsin',
      'Wyoming'
    ],
    Canada: [
      'Alberta',
      'British Columbia',
      'Manitoba',
      'New Brunswick',
      'Newfoundland and Labrador',
      'Northwest Territories',
      'Nova Scotia',
      'Nunavut',
      'Ontario',
      'Prince Edward Island',
      'Quebec',
      'Saskatchewan',
      'Yukon'
    ]
  }[selectedCountry];

  return (
    <Column>
      <InputText name="contact.name" label="Contact Name" isRequired />
      <InputText name="contact.phone_number" label="Phone Number" />
      <InputText
        name="contact.billing_email"
        label="Billing Email"
        pattern={VALIDATION_PATTERNS.EMAIL}
        isRequired
      />
      <InputText name="contact.address" label="Address" isRequired />

      <InputDropdown
        name="contact.country"
        label="Country"
        options={countries}
        onChange={({ value }) => setSelectedCountry(value)}
      />
      {proviceStates && (
        <InputDropdown
          name="contact.provice_state"
          label={isUSA ? 'State' : 'Province'}
          options={proviceStates}
        />
      )}

      <InputText name="contact.city" label="City" />
      <InputText name="contact.postal_zip" label={isUSA ? 'ZIP Code' : 'Postal Code'} />
    </Column>
  );
}
