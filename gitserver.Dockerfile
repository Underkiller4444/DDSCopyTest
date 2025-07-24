# gitserver.Dockerfile
FROM node:alpine

RUN apk add --no-cache tini git \
  && yarn global add git-http-server \
  && adduser -D -g git git

USER git
WORKDIR /home/git

RUN git config --global user.name "Anderson" && \
    git config --global user.email "matrix@neo.com"

# Remove this line unless you're not mounting volumes
RUN git init --bare repository.git 

ENTRYPOINT ["tini", "--", "git-http-server", "-p", "3000", "/home/git"]
