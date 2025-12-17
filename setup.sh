#!/bin/bash
yarn install
cd e2e && yarn install && cd ..

# Run Knex migrations
cd client && yarn migrate:latest && cd ..

echo "Setup complete!"

