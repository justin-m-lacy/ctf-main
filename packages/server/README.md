# CTF Server

## Setup

## Installion

Install Node version v16.13.2 or higher.

Install npm version 8.7 or higher ( or pnpm, yarn, etc. )

Run `npm install` on command line.

### Set environment variables:

Open `.env` file and set necessary environment variables.

`SERVER_PORT` - Network port used by the server. 3000 is default.

`KEY_PATH` - Path to signing key for hosting https.

`CERT_PATH` - Path to TLS certificate for hosting https.

`NODE_ENV` - should be 'production' or 'development'

## Run development version

In command terminal run:

`npm run run`

To run without watching for file changes. Recommended if you
are not making changes to the code.

### Run and watch for file changes:

In command terminal run:

`npm run dev` 

## Build server

run `npm run build` on command line.

Built server is compiled into ./build directory.

## Production

### HTTPS

[L](https://letsencrypt.org) - offers free TLS certificates for websites.

### Run Production

After building server,

run `npm run start` on command line.


### Create docker images

Make sure docker-desktop is running.

`npm run ctf-image` builds a docker image.

Save docker image:
`docker save image-name -o path.tar`

### Push images to Digital Ocean

`doctl registry login`

`docker tag <my-image> registry.digitalocean.com/<my-registry>/<my-image>`

`docker push registry.digitalocean.com/your-registry-name/your-image-name`