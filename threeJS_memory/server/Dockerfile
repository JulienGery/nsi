FROM node:16.15-alpine

# Create app directory
WORKDIR /app
COPY package.json /app/

RUN npm install

COPY . /app

EXPOSE 3000
CMD [ "node", "server.js" ]