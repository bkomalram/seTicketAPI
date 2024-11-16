FROM node:12

RUN mkdir -p /code

WORKDIR /code

EXPOSE 3000

COPY package*.json ./

RUN npm install

COPY . .

CMD [ "npm", "start" ]