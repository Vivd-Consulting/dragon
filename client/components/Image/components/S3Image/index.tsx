import React from 'react';

import { ExternalImage } from 'components/Image';

type S3ImageProps = {
  s3Key: string;
  className?: string;
};

export const S3Image = ({ s3Key, className }: S3ImageProps) => {
  if (!s3Key) {
    return null;
  }

  return <ExternalImage s3Key={s3Key} className={className} />;
};
