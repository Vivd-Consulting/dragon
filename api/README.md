# API

The API is a simple Express API

This API is responsible for a number of things:
- Providing endpoints for interacting with Auth0 (fetch users, add user)
- Providing endpoints for Hasura Actions, namely `updateChallenge`
- Providing endpoints for Hasura Events
- Potentially providing endpoints for the App

Each of these endpoints is authenticated with an Auth0 Bearer Token. Only users with the `admin` role are able to interact with the Auth0 endpoints.