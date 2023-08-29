#!/bin/bash
yarn install
cd e2e && yarn install && cd ..

yarn hasura metadata apply
yarn hasura migrate apply --database-name default
yarn hasura seed apply --database-name default

yarn hasura metadata reload

echo "Setup Hasura, run with: hasura console"
