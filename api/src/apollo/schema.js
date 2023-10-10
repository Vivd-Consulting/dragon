import GraphQLJSON from 'graphql-type-json';
import gql from 'graphql-tag';

import knex from '../db.js';

import {
  isAdmin,
  getProfileInfo,
  getRole,
  getUsers,
  createUser,
  inviteUser,
  resetUserPassword,
  deleteUser,
} from './users.js';

import {
  getSecret,
  createSecret,
  deleteSecret,
  updateSecret,
} from './secrets.js';

export const typeDefs = gql`
  scalar jsonb

  type Auth0Profile {
    email: String
    picture: String
  }

  type Auth0Identity {
    user_id: String
    provider: String
    connection: String
    isSocial: Boolean
  }

  type Auth0User {
    id: String
    email: String
    email_verified: Boolean
    identities: [Auth0Identity]
    name: String
    nickname: String
    picture: String
    user_id: String
    last_login: String
    last_ip: String
    logins_count: Int
    created_at: String
    updated_at: String

    role: String

    # DB USER:
    is_enabled: Boolean
    accepted_tos: Boolean
    deleted_at: String
  }

  type DbUser {
    name: String
    email: String
    is_enabled: Boolean
    accepted_tos: Boolean
    created_at: String
    updated_at: String
    deleted_at: String
  }

  enum Role {
    ADMIN
    CLIENT
    CONTRACTOR
  }

  type Query {
    auth0Users(role: Role): [Auth0User]
    auth0Profile: Auth0Profile
    userRole(user_id: String!): String
    getSecret(path: String!): String
  }

  type Mutation {
    createUser(
      name: String!
      email: String!
      password: String!
      role: String!
    ): Auth0User
    inviteUser(name: String!, email: String!, role: String!): Auth0User
    resetUserPassword(user_id: String!): Boolean
    deleteUser(user_id: String!): Boolean
    createSecret(path: String!, value: String!, env: String!, project_id: Int!, description: String): Boolean
    updateSecret(path: String!, value: String!, env: String!, project_id: Int, description: String): Boolean
    deleteSecret(path: String!): Boolean
  }
`;

export const resolvers = {
  Query: {
    auth0Users: async (parent, args, context) => {
      if (!isAdmin(context)) {
        return null;
      }

      const filterByRole = args.role;

      try {
        const auth0Users = await getUsers();

        const users = [];

        for (let user of auth0Users) {
          const role = await getRole(user.user_id);

          if (role.toUpperCase() !== filterByRole) {
            continue;
          }

          const dbUser = await knex('dragon_user')
            .where({ id: user.user_id, deleted_at: null })
            .first();

          users.push({
            ...user,
            ...dbUser,
            role,
            adAccounts,
          });
        }

        return users;
      } catch (e) {
        console.log(e);
        return null;
      }
    },
    auth0Profile: async (parent, args, context) => {
      if (!isAdmin(context)) {
        return null;
      }

      try {
        const user_id = context.user.sub;

        const { email, picture } = await getProfileInfo(user_id);
        return { email, picture };
      } catch (e) {
        console.log(e);
        return null;
      }
    },
    userRole: async (parent, args, context) => {
      if (!isAdmin(context) && args.user_id !== context.user.sub) {
        return null;
      }

      return getRole(args.user_id);
    },
    getSecret: async (parent, args, context) => {
      // if (!isAdmin(context)) {
      //   return null;
      // }

      const secret = await getSecret({ path: args.path });
      return secret.Parameter.Value;
    }
  },
  Mutation: {
    createUser: async (parent, args, context) => {
      if (!isAdmin(context)) {
        return null;
      }

      return createUser(args);
    },
    inviteUser: async (parent, args, context) => {
      if (!isAdmin(context)) {
        return null;
      }

      return inviteUser(args);
    },
    resetUserPassword: async (parent, args, context) => {
      if (!isAdmin(context)) {
        return null;
      }

      return resetUserPassword(args.user_id);
    },
    deleteUser: async (parent, args, context) => {
      if (!isAdmin(context) && args.user_id !== context.user.sub) {
        return null;
      }

      return deleteUser(args.user_id);
    },
    createSecret: async (parent, args, context) => {
      // TODO:
      // if (!isAdmin(context)) {
      //   return null;
      // }

      const { path, env, value, project_id, description } = args;

      // Create the secret in SSM
      await createSecret({ path, value });

      // Create the secret in the DB, don't store the value, just path and metadata
      await knex('secret').insert({
        path,
        env,
        project_id,
        description,
      });
    },
    updateSecret: async (parent, args, context) => {
      // if (!isAdmin(context)) {
      //   return null;
      // }

      const { path, env, value, project_id, description } = args;

      await updateSecret({ path, value });

      await knex('secret')
        .where({ path })
        .update({
          project_id,
          env,
          description,
          path,
          updated_at: new Date(),
        });
    },
    deleteSecret: async (parent, args, context) => {
      // if (!isAdmin(context)) {
      //   return null;
      // }

      const { path } = args;

      await deleteSecret({ path });

      await knex('secret')
        .where({ path })
        .update({
          deleted_at: new Date(),
        });
    },
  },
  jsonb: GraphQLJSON,
};
