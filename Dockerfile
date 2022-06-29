FROM node:18-alpine
WORKDIR /usr/src/app
COPY . .
RUN npm install
EXPOSE 3000
CMD [ "node", "-r" , "dotenv/config", "index.mjs" ]
