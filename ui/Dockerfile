FROM node:16-slim

RUN apt-get update -y && apt-get install git -y

RUN mkdir /code
RUN useradd -ms /bin/bash dev
RUN chown -R dev:dev /code
USER dev
WORKDIR /code

ADD package.json .
ADD yarn.lock .
RUN yarn

ADD . .
