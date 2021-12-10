FROM node:lts-alpine as build

RUN yarn global add expo-cli;

WORKDIR /etesync-notes

COPY package.json ./package.json
COPY yarn.lock ./yarn.lock

RUN yarn install; 

COPY . ./

RUN expo build:web

FROM nginx:alpine

COPY --from=build /etesync-notes/web-build /usr/share/nginx/html
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80



