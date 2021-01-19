set -e

yarn lint --max-warnings 0
yarn tsc

# XXX Hack so that we have access to the expo utilities
yarn add expo

SSH_HOST=notes.etesync.com
SSH_PORT=22
SSH_USER=etesync
SSH_TARGET_DIR=sites/notes.etesync.com

OUTPUTDIR=./web-build

export INLINE_RUNTIME_CHUNK=false

yarn expo build:web

rsync -e "ssh -p ${SSH_PORT}" -P --delete -rvc -zz ${OUTPUTDIR}/ ${SSH_USER}@${SSH_HOST}:${SSH_TARGET_DIR}


# Deploy the expo build
SSH_HOST=expo.etesync.com
SSH_PORT=22
SSH_USER=etesync
SSH_TARGET_DIR=sites/expo.etesync.com

OUTPUTDIR='dist'

PUBLIC_URL=https://expo.etesync.com
DEPLOY_PATH='etesync-notes/release'
# DEPLOY_PATH='test'

APP_VERSION=2

rm -rf "$OUTPUTDIR"
yarn run expo export --dump-sourcemap --public-url ${PUBLIC_URL}/${DEPLOY_PATH}/${APP_VERSION}
rsync -e "ssh -p ${SSH_PORT}" -P --delete -rvzc ${OUTPUTDIR}/ ${SSH_USER}@${SSH_HOST}:${SSH_TARGET_DIR}/${DEPLOY_PATH}/${APP_VERSION}

yarn remove expo
