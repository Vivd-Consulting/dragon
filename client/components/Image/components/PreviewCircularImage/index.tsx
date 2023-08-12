import React from 'react';

import { S3Image } from 'components/Image';

import styles from './styles.module.sass';

type PreviewCircularImageProps = {
  s3Key: string;
};

export const PreviewCircularImage = ({ s3Key }: PreviewCircularImageProps) => {
  return <S3Image s3Key={s3Key} className={styles.previewCircularImage} />;
};
