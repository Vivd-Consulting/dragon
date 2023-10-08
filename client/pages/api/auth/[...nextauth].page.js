import NextAuth from 'next-auth';
import Auth0Provider from 'next-auth/providers/auth0';

import knex from '../db';

export default NextAuth({
  // Configure one or more authentication providers
  providers: [
    Auth0Provider({
      clientId: process.env.AUTH0_CLIENT,
      clientSecret: process.env.AUTH0_CLIENT_SECRET,
      issuer: process.env.AUTH0_URI,
      checks: ['pkce', 'state']
    })
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account) {
        token.accessToken = account.id_token;
      }

      if (profile) {
        token.role = profile['https://hasura.io/jwt/claims']['x-hasura-role'];
        token.email_verified = profile['email_verified'];
      }

      return token;
    },
    session({ session, token }) {
      session.id = token.sub;
      session.accessToken = token.accessToken;
      session.role = token.role;
      session.emailVerified = token.email_verified;

      return session;
    },
    async signIn({ user, profile }) {
      try {
        // const claims = profile['https://hasura.io/jwt/claims'];
        // const role = claims?.['x-hasura-role']?.toLowerCase();

        const dragonUser = await knex('dragon_user').where({ id: user.id }).first();

        if (!dragonUser) {
          await knex('dragon_user').insert({
            name: user.name,
            id: user.id,
            email: user.email
          });
        }

        return true;
      } catch (e) {
        console.error(e);
        return false;
      }
    }
  },
  secret: process.env.SECRET
});
