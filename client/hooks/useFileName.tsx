import { useQuery } from '@apollo/client';
import gql from 'graphql-tag';

export function useFileName(fileId) {
  const { data, loading, error } = useQuery(FILE_NAME, {
    variables: {
      fileId
    },
    skip: !fileId
  });

  if (loading) {
    return [[]];
  }

  if (error) {
    console.error(error);
    return [[]];
  }

  const { media_by_pk } = data || {};

  return [media_by_pk?.filename, loading];
}

const FILE_NAME = gql`
  query fileName($fileId: Int!) {
    media_by_pk(id: $fileId) {
      filename
    }
  }
`;
