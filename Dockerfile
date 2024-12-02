FROM node:22.11.0-alpine

WORKDIR /usr/app

COPY package*.json ./

RUN npm install

COPY prisma ./prisma

RUN npx prisma generate
RUN npx prisma migrate deploy

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
