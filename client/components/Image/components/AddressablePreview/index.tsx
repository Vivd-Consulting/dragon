import { useQuery } from '@apollo/client';
import React from 'react';

import { S3Image } from 'components/Image';

import addressablePreviewQuery from './addressablePreview.gql';

type AddressablePreviewProps = {
  id: string;
  className?: string;
};

export function AddressablePreview({ id, className }: AddressablePreviewProps) {
  const { data } = useQuery(addressablePreviewQuery, {
    variables: {
      id
    },
    skip: !id
  });

  const { key } = data?.addressable[0]?.previewImage || {};

  return <S3Image s3Key={key} className={className} />;
}
