FROM node:latest

COPY . .
RUN yarn install
RUN yarn build
RUN source .env.example

CMD ["yarn", "start"]
