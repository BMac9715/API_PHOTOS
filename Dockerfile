FROM node:18-alpine
LABEL Author Bryan Macario <bemacarioc@gmail.com>

WORKDIR /usr/src/app

COPY package.json ./

RUN npm i
RUN npm i -g typescript
RUN npm i -g ts-node

COPY . .

RUN npm run compile

EXPOSE 3000

CMD [ "npm", "start" ]
