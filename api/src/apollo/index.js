import { ApolloServer, AuthenticationError } from 'apollo-server';
import jwt_decode from 'jwt-decode';

import { typeDefs, resolvers } from './schema.js';

import { getAuthToken, hasAdminOverride } from '../utils.js';

const isDev = process.env.NODE_ENV === 'development';

const schema = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => {
    if (
      !req.headers.authorization ||
      req.headers.authorization === 'undefined'
    ) {
      if (hasAdminOverride(req.headers)) {
        return { user: { email: 'su@test.com', role: 'admin' } };
      }

      throw new AuthenticationError("No auth header");
    }

    const user = jwt_decode(getAuthToken(req.headers));
    const role = user['https://hasura.io/jwt/claims']?.['x-hasura-role'];
    // const clientId = user["https://hasura.io/jwt/claims"]?.["x-hasura-client-id"];
    // const contractorId = user["https://hasura.io/jwt/claims"]?.["x-hasura-contractor-id"];

    return { user, role };
  },
  // This always needs to be enabled for Hasura to instrospect the schema
  introspection: true,
  playground: isDev,
});

function apollo() {
  return schema
    .listen({ port: process.env.APOLLO_PORT || 3008 })
    .then(({ url }) => {
      console.log(`Apollo listening on: ${url}`);
    });
}

export default apollo;
