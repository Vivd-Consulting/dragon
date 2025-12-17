# Dragon Dash

Dragon is an internal Next.js application for managing clients, projects, env variables, time tracking, invoicing, book-keeping and reporting for software development agencies.

<img src="https://github.com/user-attachments/assets/ffc590a6-6955-40d7-b288-4425ad6c43f7" width="200" height="200" />

## Quickstart

1. Set all of the Environment Variables
2. Run the project from the root: `docker-compose up`
3. Run migrations: `./setup.sh`

## Environment Variables

### api
Create a `api/.env` file and set the following:
```
AUTH0_CLIENT=
AUTH0_CLIENT_SECRET=
AUTH0_AUD=
AUTH0_URI=

DATABASE_URL=postgres://postgres:pgpass@postgres:5432/postgres

PORT=3006
NODE_ENV=development
```

### client
Create a `client/.env.local` file and set the following:
```
DATABASE_URL=postgres://postgres:pgpass@postgres:5432/postgres

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


## Run migrations

Run `./setup.sh`, this will:

```bash
# Install dependencies
yarn install
cd e2e && yarn install && cd ..

# Run Knex migrations
cd client && yarn migrate:latest && cd ..
```

### E2E Testing
See [/e2e/README.md](e2e/README.md)

### API
See [/api/README.md](api/README.md)

### Client
See [/client/README.md](client/README.md)
