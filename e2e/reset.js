require("dotenv").config();

const knex = require("knex");

async function dropDatabases() {
  const _knex = knex({
    client: "postgresql",
    connection: process.env.DATABASE_URL,
  });

  await _knex.raw(`
    DROP SCHEMA IF EXISTS public CASCADE;
    DROP SCHEMA IF EXISTS accounting CASCADE;
    DROP SCHEMA IF EXISTS hdb_catalog CASCADE;
  `);

  await _knex.raw(`
    CREATE SCHEMA public;
    CREATE SCHEMA accounting;
    CREATE SCHEMA hdb_catalog;
  `);

  _knex.destroy();

  return null;
}

dropDatabases().then(() => {
  console.log("Dropped databases");
  process.exit(0);
});
