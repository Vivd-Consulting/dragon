import { useQuery } from '@apollo/client';
import gql from 'graphql-tag';

export function useClientsQuery() {
  const { data, loading, error } = useQuery(CLIENTS);

  if (loading) {
    return [[]];
  }

  if (error) {
    console.error(error);
    return [[]];
  }

  const { client } = data || {};

  return [client, loading];
}

const CLIENTS = gql`
  query clients {
    client(where: { archived_at: { _is_null: true } }) {
      id
      name
    }
  }
`;
