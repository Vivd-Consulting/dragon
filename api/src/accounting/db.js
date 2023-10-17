import knex from 'knex'

const _knex = knex({
  client: "postgresql",
  connection: `${process.env.DATABASE_URL}?schema=accounting`,
});

export default _knex;
