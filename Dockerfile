FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

COPY ./bin ./bin
COPY ./controllers ./controllers
COPY ./models ./models
COPY ./public ./public
COPY ./routes ./routes
COPY ./views ./views

COPY app.js ./

RUN npm install

EXPOSE 3000

CMD [ "npm","start" ]