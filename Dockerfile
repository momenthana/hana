FROM node:16-alpine

WORKDIR /hana/bot

COPY package*.json yarn.lock ./
RUN yarn
COPY . .
CMD [ "yarn", "start" ]
