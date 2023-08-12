import { useQuery } from '@apollo/client';

import { S3Image } from 'components/Image';

import mediaQuery from './media.gql';

type ImageFromIdProps = {
  id: string;
  className?: string;
};

export function ImageFromId({ id, className }: ImageFromIdProps) {
  const { data } = useQuery(mediaQuery, {
    variables: {
      id
    },
    skip: !id
  });

  const { key } = data?.media[0] || {};

  return <S3Image s3Key={key} className={className} />;
}
