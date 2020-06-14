FROM node:11-alpine

RUN mkdir -p /home/node/api
WORKDIR /home/node/api

RUN npm install

CMD npm start

