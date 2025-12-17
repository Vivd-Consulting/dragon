import knex from 'knex';

const db = knex({
  client: 'postgresql',
  connection: process.env.DATABASE_URL,
});

export default db;

