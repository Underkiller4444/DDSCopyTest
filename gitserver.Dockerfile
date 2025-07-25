# gitserver.Dockerfile
FROM node:alpine

RUN apk add --no-cache tini git \
  && yarn global add git-http-server \
  && adduser -D -g git git

USER git
WORKDIR /home/git

RUN git config --global user.name "neo" \
    && git config --global user.email "ner@anderson.com" \
    && git init --bare repository.git

ENTRYPOINT ["tini", "--", "git-http-server", "-p", "3000", "/home/git"]

