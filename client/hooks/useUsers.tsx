import { useQuery } from '@apollo/client';
import gql from 'graphql-tag';

export default function useUsers(role = 'USER') {
  const { data, loading, error } = useQuery(USERS, {
    variables: { role }
  });

  if (loading) {
    return [[]];
  }

  if (error) {
    console.error(error);
    return [[]];
  }

  const { auth0Users } = data || {};

  return [auth0Users];
}

const USERS = gql`
  query users($role: Role) {
    auth0Users(role: $role) {
      id
      name
      email
      role
    }
  }
`;
