import React, { useState } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { useQuery, ApolloProvider } from '@apollo/client';
import gql from 'graphql-tag';
import { create } from 'zustand';
import { Button } from 'primereact/button';
import { signOut } from 'next-auth/react';

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

  console.log({ data, status });

  useAuth = create(() => ({
    user: null,
    role: 0,
    token: '',
    dragonUser: {},
    expiry: 0
  }));

  if (status === 'loading') {
    return null;
  } else if (status === 'unauthenticated') {
    return <Unauthenticated />;
  }

  // if (!data) {
  //   signIn('auth0');
  //   return null;
  // }

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

  const { data } = useQuery(
    gql`
      query dragonUser($email: String!) {
        dragon_user(where: { email: { _eq: $email } }) {
          id
          name
          email
          accepted_tos
          is_enabled
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
    const _role: Role = {
      admin: Role.Admin
    }[role];

    console.log({ _role, data });

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

function Unauthenticated() {
  return (
    <div className="flex flex-column gap-4">
      <div className="pb-4">
        <h1>Unauthorized</h1>
        <span>You are not authorized to view this page.</span>

        <Button
          label="Sign out"
          className="block"
          onClick={() =>
            signOut({
              callbackUrl: process.env.NEXT_PUBLIC_LOGOUT_URL
            })
          }
        />
        <Button label="Sign In" className="block" onClick={() => signIn('auth0')} />
      </div>
    </div>
  );
}
