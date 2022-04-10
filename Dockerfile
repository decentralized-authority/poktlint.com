FROM node:14

RUN mkdir /app
RUN mkdir /app/build

WORKDIR /app

COPY package.json /app/
COPY yarn.lock /app/

RUN yarn

COPY . /app/

VOLUME /app

ENTRYPOINT ["yarn", "run", "build"]
