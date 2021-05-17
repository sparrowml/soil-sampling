FROM python:3.7-slim

RUN apt-get update -y && apt-get install git -y

RUN mkdir /code
RUN useradd -ms /bin/bash dev
RUN chown -R dev:dev /code
USER dev
WORKDIR /code

RUN mkdir api
WORKDIR /code/api

ENV PATH="/home/dev/.local/bin:${PATH}"

ADD requirements.txt .
RUN pip install -r requirements.txt

ADD . .
