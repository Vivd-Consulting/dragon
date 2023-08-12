import React, { useState } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { ApolloProvider } from '@apollo/client';
import gql from 'graphql-tag';
import { create } from 'zustand';

import { useQueryOnce } from 'hooks/useQuery';

import { Role } from 'types/roles';

import createApolloClient from '../services/apollo';

// @ts-ignore: Find a better way to do this
// eslint-disable-next-line import/no-mutable-exports
export let useAuth;

type sessionData = {
  user: {};
  role: string;
  accessToken: string;
};

interface SessionData {
  user: string;
  role: string;
  accessToken: string;
}
export function GqlAuthProvider({ children }) {
  const { data, status } = useSession();

  useAuth = create(() => ({
    user: null,
    role: 0,
    token: '',
    dragonUser: {},
    expiry: 0
  }));

  if (status === 'loading') {
    return null;
  }

  if (!data) {
    signIn('auth0');
    return null;
  }

  const { user, role, accessToken } = data as Partial<SessionData>;

  if (accessToken !== localStorage.getItem('dragonAccessToken')) {
    localStorage.setItem('dragonAccessToken', accessToken as string);
  }

  return (
    <GqlProvider user={user} role={role} accessToken={accessToken}>
      {children}
    </GqlProvider>
  );
}

function GqlProvider({ user, role, accessToken, children }) {
  const [client] = useState(createApolloClient(accessToken));

  const { data } = useQueryOnce(
    gql`
      query dragonUser($email: String!) {
        dragon_user(where: { email: { _eq: $email } }) {
          id
          name
          email
          accepted_tos
          date_subscribed
          date_unsubscribed
        }
      }
    `,
    {
      variables: {
        email: user.email
      },
      client
    }
  );

  if (data) {
    const _role: Role =
      {
        admin: Role.Admin
      }[role] || Role.User;

    const userData = {
      ...data.dragon_user[0]
    };

    useAuth.setState({
      user,
      role: _role,
      token: accessToken,
      dragonUser: userData,
      isAdmin: _role === Role.Admin
    });

    return <ApolloProvider client={client}>{children}</ApolloProvider>;
  }

  return null;
}
