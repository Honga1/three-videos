FROM node:12-alpine

ENV NODE_ENV=production

ADD ./package.json ./package.json
ADD ./package-lock.json ./package-lock.json

RUN npm ci --only=production

ADD ./frontend ./build
EXPOSE 5000
ENTRYPOINT npm run serve
