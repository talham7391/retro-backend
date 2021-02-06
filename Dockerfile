FROM node:latest

COPY . .
RUN yarn install
RUN yarn build
ENV MONGODB_HOST=localhost
ENV MONGODB_PORT=27017
ENV MONGODB_USER=root
ENV MONGODB_PASS=pass

CMD ["yarn", "start"]
