import React from 'react';

import useGetImage from 'hooks/useGetImage';

type ExternalImageProps = {
  s3Key: string;
  className?: string;
};

export const ExternalImage = ({ s3Key, className }: ExternalImageProps) => {
  const url = useGetImage(s3Key);

  return (
    <div>
      {url ? (
        <img src={url} className={className} alt="" />
      ) : (
        <span style={{ fontSize: '1rem' }}>Loading...</span>
      )}
    </div>
  );
};
