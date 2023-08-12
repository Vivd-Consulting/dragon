import GraphQLJSON from 'graphql-type-json';
import gql from 'graphql-tag';

import { graphApi } from '../facebook.js';

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
    date_subscribed: String
    date_unsubscribed: String
    subscribed: Boolean
    accepted_tos: Boolean
    deleted_at: String
  }

  type DbUser {
    name: String
    email: String
    bm_id: String
    date_subscribed: String
    date_unsubscribed: String
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
    balance: Float
    totalBalance: Float
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
    adAccounts: async (parent, args, context) => {
      const { bmId } = context;
      const { getLinkedAdAccounts, getAdAccountInsights } = await graphApi(
        bmId
      );

      const accounts = await getLinkedAdAccounts();

      for (const account of accounts) {
        const insights = await getAdAccountInsights(account.id);
        account.insights = insights;
      }

      return accounts;
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
  },
  jsonb: GraphQLJSON,
};
