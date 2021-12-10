# Docker Image

The image is built on `node:lts-alpine` using `expo-cli`, and packaged in a `nginx:alpine` image.

The container will expose port 80, when using in production, please use a reverse-proxy for SSL termination or mount certificates and the new `/etc/nginx/conf.d/default.conf`, more details at [nginx Complex configuration](https://github.com/docker-library/docs/tree/master/nginx#complex-configuration)

## How to Build

```Shell
docker build -t etesync/notes -f docker/Dockerfile .
```

## Usage

Just type `docker run -d -p 8080:80 --name etesync-notes etesync/notes`, this will enable access through http://localhost:8080