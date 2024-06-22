# ctf-client


## Build Environment Variables

Environment variables used in building only

`FLAVOR` - ctf branding/type to create.

`MANUAL_ENV` - Do not load .env files before building.
Used for building from servers/droplets that set environment variables
from scripts.

`VITE_CLIENT_BASE` - Base directory of client webpage on host.

## Set Environment Variables

`VITE_SECURE` - Whether to use https/wss
`VITE_SERVER_KEY` - Key used to connect to server.
`VITE_SERVER_HOST` - Ctf host url.
`VITE_SERVER_PORT` - Host port.
`VITE_FLAG_NAME` - What to call flag items in game.

`VITE_GAME_TITLE` - Long title of game.
`VITE_SHORT_TITLE` - Game acronym
`VITE_LENS_FLAG` - Apply 3d character lensing to flag
## Running

Install Dependencies

`npm i`

Build Game:

`vite build`

Develop

`vite dev`



# Assets

Assets consist of static assets, known at compilation time, and public/ assets loaded dynamically
based on match data.

The location map of dynamic assets is computed at compilation and stored in public/asset-map.json

Match events attempt to find an audio matching the event name.

Audio is first searched by craft, then by shared audio asset.

## Audio Assets


# Debugging

Press 'g' to reset ability timers.