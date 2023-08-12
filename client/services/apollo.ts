import { ApolloClient, InMemoryCache, HttpLink, from } from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { signOut } from 'next-auth/react';

const createApolloClient = (authToken: string) => {
  const headers = {
    Authorization: `Bearer ${authToken}`
  };

  if (process.env.NODE_ENV === 'development') {
    // Pass X-Hasura-Role to automatically test other roles
    // headers['x-hasura-role'] = 'admin';
  }

  const errorLink = onError(({ response }) => {
    const errors = response?.errors || [];
    const hasError = errors.length > 0;

    // Log out user if there's an error
    if (hasError) {
      const errorCode = errors[0].extensions.code;

      if (errorCode === 'invalid-jwt' || '') {
        signOut();
      }
    }
  });

  const link = new HttpLink({
    uri: process.env.NEXT_PUBLIC_HASURA_ENDPOINT,
    headers
  });

  return new ApolloClient({
    link: from([errorLink, link]),
    cache: new InMemoryCache({
      addTypename: false
    })
  });
};

export default createApolloClient;
