import knex from 'knex';

const _knex = knex({
  client: 'postgresql',
  connection: process.env.DATABASE_URL
});

export default _knex;
