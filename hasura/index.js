require("dotenv").config();

const knex = require("knex");
const fs = require("fs");

async function migrateAndSeed() {
  const _knex = knex({
    client: "postgresql",
    connection: process.env.HASURA_GRAPHQL_DATABASE_URL,
  });

  await _knex.raw(`
    DROP SCHEMA IF EXISTS public CASCADE;
  `);

  const migrations = fs.readdirSync("./migrations/default");
  for (const migration of migrations) {
    const up = fs.readFileSync(
      `./migrations/default/${migration}/up.sql`,
      "utf8"
    );
    await _knex.raw(up);
  }

  const seeds = fs.readdirSync("./seeds/default");
  for (const seed of seeds) {
    await _knex.raw(fs.readFileSync(`./seeds/default/${seed}`, "utf8"));
  }

  return null;
}

migrateAndSeed().then(() => {
  console.log("Cleaned and seeded default database");
  process.exit(0);
});
