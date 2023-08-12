import gql from 'graphql-tag';
import { useLazyQuery } from '@apollo/client';

export default function useMaxId(queryName) {
  const query = gql`
  {
    ${queryName}_aggregate {
      aggregate {
        max {
          id
        }
      }
    }
  }`;

  const [queryCallback] = useLazyQuery(query);

  return async () => {
    const { data } = await queryCallback();

    return data[`${queryName}_aggregate`].aggregate.max.id + 1;
  };
}
