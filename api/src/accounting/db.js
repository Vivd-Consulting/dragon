import knex from 'knex'

const _knex = knex({
  client: "postgresql",
  connection: process.env.ACCOUNTING_DATABASE_URL,
});

export default _knex;
