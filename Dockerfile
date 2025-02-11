FROM node:20

WORKDIR /bot

COPY package.json /bot/
COPY package-lock.json /bot/

RUN npm install

EXPOSE 8080

COPY . /bot

CMD ["node", "index.js"]
