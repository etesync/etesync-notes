set -e

SSH_HOST=notes.etesync.com
SSH_PORT=22
SSH_USER=etesync
SSH_TARGET_DIR=sites/notes.etesync.com

OUTPUTDIR=./web-build

export INLINE_RUNTIME_CHUNK=false

yarn expo build:web

rsync -e "ssh -p ${SSH_PORT}" -P --delete -rvc -zz ${OUTPUTDIR}/ ${SSH_USER}@${SSH_HOST}:${SSH_TARGET_DIR}
