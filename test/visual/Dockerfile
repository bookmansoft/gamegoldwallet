FROM circleci/node:9-browsers
USER root
COPY package.json /ggwallet/package.json
COPY src/environments/dev.ts /ggwallet/src/environments/dev.ts
WORKDIR /ggwallet/
RUN npm install --unsafe-perm
COPY . /copggwalletay/
CMD [ "npm", "run", "e2e:capture-latest"]