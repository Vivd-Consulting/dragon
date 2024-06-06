import dotenv from 'dotenv';

if (!process.env?.NODE_ENV || process.env?.NODE_ENV === 'development') {
  dotenv.config({ path: '.env.local' });
}

const codegen = {
  schema: [
    {
      [process.env.NEXT_PUBLIC_HASURA_ENDPOINT]: {
        headers: {
          'x-hasura-admin-secret': process.env.HASURA_GRAPHQL_ADMIN_SECRET
        }
      }
    }
  ],
  documents: ['./**/*.gql'],
  overwrite: true,
  generates: {
    './generated/graphql.ts': {
      plugins: ['typescript', 'typescript-operations', 'typescript-react-apollo'],
      config: {
        skipTypename: false,
        withHooks: true,
        withHOC: false,
        withComponent: false
      }
    }
  }
};

export default codegen;
