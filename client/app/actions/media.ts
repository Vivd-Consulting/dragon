'use server';

import db from '@/lib/db';
import { handleActionError } from './utils';
import type { Media } from '@/lib/knex/types';

export async function getMedia(id: string | number) {
  try {
    const media = await db<Media>('media').where({ id: Number(id) }).first();

    if (!media) {
      return { error: 'Media not found' };
    }

    return { data: media };
  } catch (error) {
    return handleActionError(error);
  }
}

