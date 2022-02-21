FROM node:12

RUN mkdir -p /code

WORKDIR /code

COPY package*.json ./

RUN npm install

COPY . .

CMD [ "npm", "dev" ]