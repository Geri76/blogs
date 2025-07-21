FROM node:alpine

WORKDIR /app

COPY . .

RUN npm ci --only=production --no-audit --no-fund --loglevel verbose

EXPOSE 3000

CMD [ "node", "index.js" ]
