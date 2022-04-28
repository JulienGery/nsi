FROM node:16.15-alpine

# Create app directory
WORKDIR /app
COPY threeJS_memory/server/package.json /app/

RUN npm install

COPY . /app

EXPOSE 3000
CMD [ "npm", "start" ]