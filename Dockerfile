# A quick Dockerfile to enable local testing / running
FROM node:12

# make the src dir and only copy the package.json in
# this helps prevent long rebuild times by only reinstalling
# packages when the package.json changes
RUN mkdir /src
COPY ./package.json /src
RUN npm install && \
    curl https://cli-assets.heroku.com/install.sh | sh

# copy in the rest of the src folder now
COPY . /src

WORKDIR /src
CMD heroku local

