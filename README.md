# Dragon Dash

Dragon is an internal Next.js application for managing clients, projects, env variables, time tracking, invoicing, book-keeping and reporting for software development agencies.

## Quickstart
In the root of the project, run: `yarn install`. That will make the `hasura-cli` available for the project. Invoke it with `yarn hasura ...`.

1. Set all of the Environment Variables
2. Run the project from the root: `docker-compose up`
3. Run migrations and seed data: `./setup.sh`
4. From the root folder, run the `yarn hasura:console`:

By default the Hasura console will be running at: http://localhost:9695/console/

## Environment Variables

### hasura

In the project root, create a `.env` file:

```
HASURA_GRAPHQL_SERVER_PORT=3002
HASURA_GRAPHQL_METADATA_DATABASE_URL=postgres://postgres:pgpass@postgres:5432/postgres
HASURA_GRAPHQL_ENABLE_CONSOLE=false
HASURA_GRAPHQL_DEV_MODE=true
HASURA_GRAPHQL_ENABLED_LOG_TYPES=startup, http-log, webhook-log, websocket-log, query-log
HASURA_GRAPHQL_ADMIN_SECRET=9ltBXk4k2OoPtSKP8qQqQE0J4HLU59WI
HASURA_GRAPHQL_JWT_SECRET=
HASURA_GRAPHQL_DATABASE_URL=postgres://postgres:pgpass@postgres:5432/postgres
```

`HASURA_GRAPHQL_JWT_SECRET` is generated from:
https://hasura.io/jwt-config/

### api
Create a `api/.env` file and set the following:
```
AUTH0_CLIENT=
AUTH0_CLIENT_SECRET=
AUTH0_AUD=
AUTH0_URI=

DATABASE_URL=postgres://postgres:pgpass@postgres:5432/postgres
HASURA_GRAPHQL_ADMIN_SECRET=

PORT=3006
NODE_ENV=development
```

### client
Create a `client/.env.local` file and set the following:
```
NEXT_PUBLIC_HASURA_ENDPOINT=http://localhost:3002/v1/graphql
NEXTAUTH_SECRET=${openssl rand -base64 32}

AUTH0_CLIENT=
AUTH0_CLIENT_SECRET=
AUTH0_URI=

API_HOST=http://localhost:3006
S3_BUCKET=/localhost/

NODE_ENV=development
PORT=3000
```

Any environment variables prefixed with `NEXT_PUBLIC_` will be publically available in the client: `process.env.NEXT_PUBLIC_...`

### stats

Create a `stats/.env` file:
```
AWS_ACCESS_KEY=
AWS_SECRET_KEY=
DATABASE_URL=postgres://postgres:pgpass@postgres:5432/postgres
DB_SCHEMA=stats
NODE_ENV=development
PORT=3004
```

## Run the project

From the root, run:

```bash
docker-compose up
```

The client will be available at: http://localhost:3000


## Run migrations and seed data

Run `./setup.sh`, this will:

```bash
yarn hasura metadata apply
yarn hasura migrate apply --database-name default
yarn hasura seed apply --database-name default

docker-compose exec stats yarn clean
docker-compose exec stats yarn migrate up
docker-compose exec stats yarn seed

yarn hasura metadata reload
```

### Optionally run the Hasura console

```bash
yarn hasura:console
```

By default the Hasura console will be running at:
http://localhost:9695/console/

### E2E Testing
See [/e2e/README.md](e2e/README.md)

### API
See [/api/README.md](api/README.md)

### Client
See [/client/README.md](client/README.md)
