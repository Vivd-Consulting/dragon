# Hasura GraphQL Server

## Setup

- Run `docker-compose up` at the root of the project
- `cd hasura`
- Run `hasura metadata apply` to updata Hasura's metadata
- Run `hasura migrate apply` to apply migrations
- Run `hasura seed apply` to apply seeds
- Finally, you can manage Hasura from the console, by running `hasura console`