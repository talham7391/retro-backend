FROM node:latest

COPY . .
RUN yarn install
RUN yarn build

CMD ["yarn", "start"]
