FROM node:12-stretch

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm i
COPY . .

ENV NODE_END "production"
CMD ["node", "src/app"]
