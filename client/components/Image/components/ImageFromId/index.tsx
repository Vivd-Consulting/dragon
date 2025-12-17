'use client';

import { useEffect, useState } from 'react';
import { S3Image } from 'components/Image';
import { getMedia } from '@/app/actions/media';

type ImageFromIdProps = {
  id: string | number;
  className?: string;
};

export function ImageFromId({ id, className }: ImageFromIdProps) {
  const [key, setKey] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    async function loadMedia() {
      try {
        const result = await getMedia(typeof id === 'string' ? Number(id) : id);
        if ('data' in result && result.data?.key) {
          setKey(result.data.key);
        }
      } catch (error) {
        console.error('Error loading media:', error);
      }
    }

    loadMedia();
  }, [id]);

  if (!key) return null;

  return <S3Image s3Key={key} className={className} />;
}
