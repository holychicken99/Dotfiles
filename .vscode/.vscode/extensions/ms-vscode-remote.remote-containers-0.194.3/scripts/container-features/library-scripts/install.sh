#!/bin/sh
set -e

set -a
. /tmp/library-scripts/features.env
set +a

if [ "$GITHUB" = "true" ]
then
	bash /tmp/library-scripts/github-debian.sh
fi

if [ "$DIND" = "true" ]
then
	bash /tmp/library-scripts/docker-in-docker-debian.sh
fi

if [ ! -z "$NODEJS" ]
then
	bash /tmp/library-scripts/node-debian.sh /usr/local/share/nvm "$NODEJS"
fi
