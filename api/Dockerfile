FROM node:18.16.0-alpine

ENV NODE_ENV=production

WORKDIR /opt/api

COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile --no-cache

COPY . /opt/api

EXPOSE 8080
EXPOSE 8081

CMD ["yarn", "start"]
