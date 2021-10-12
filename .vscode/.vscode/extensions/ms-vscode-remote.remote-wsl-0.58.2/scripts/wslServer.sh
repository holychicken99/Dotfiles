#!/usr/bin/env sh
#
# Copyright (c) Microsoft Corporation. All rights reserved.
COMMIT=$1
QUALITY=$2
DATAFOLDER=$3
POLLING_INTERVAL=$4

shift 4

LOGGING_ARGS=""

if [ "$VSCODE_WSL_DEBUG_INFO" = true ]; then
	set -x
	LOGGING_ARGS="--log=trace"
fi

if [ ! -d "$HOME/$DATAFOLDER" ]; then
	if [ -d "$HOME/.vscode-remote" ]; then
		echo "Migrating .vscode-remote to $DATAFOLDER..."
		mv "$HOME/.vscode-remote" "$HOME/$DATAFOLDER"
	fi
fi

CODE_PROFILE="$HOME/$DATAFOLDER/server-env-setup"

printf "Setting up server environment: Looking for %s. " "$CODE_PROFILE"
if [ -f "$CODE_PROFILE" ]; then
	echo "Found, executing..."
	# shellcheck disable=SC1090
	. "$CODE_PROFILE"
else
	echo "Not found."
fi


VSCODE_REMOTE_BIN="$HOME/$DATAFOLDER/bin"
WSL_VERSION=$(uname -r)

echo "WSL version: $WSL_VERSION $WSL_DISTRO_NAME"

"$(dirname "$0")/wslDownload.sh" "$COMMIT" "$QUALITY" "$VSCODE_REMOTE_BIN"
RC=$?;
if [ $RC -ne 0 ]; then 
	exit $RC
fi

POLLING_ARGS=""
case "$(uname -r)" in
	*Microsoft)
		if [ "$POLLING_INTERVAL" -ne "0" ]; then
			POLLING_ARGS="--fileWatcherPolling=$POLLING_INTERVAL"
		fi
		;;
	*)
		echo "WSL2-shell-PID: $$"
		;;
esac

echo "Starting server: $VSCODE_REMOTE_BIN/$COMMIT/server.sh ${INSPECT:-} --port=0 --use-host-proxy --without-browser-env-var --disable-websocket-compression --print-ip-address --enable-remote-auto-shutdown $POLLING_ARGS $LOGGING_ARGS $*"
if [ -f /etc/alpine-release ]; then
	echo ""
	echo "* Note: Support for Alpine Linux is in preview."
elif [ "$(uname -m)" = "aarch64" ]; then
	echo ""
	echo "* Note: Support for ARM is in preview."
fi
export VSCODE_AGENT_FOLDER="$HOME/$DATAFOLDER"
"$VSCODE_REMOTE_BIN/$COMMIT/server.sh" "${INSPECT:-}" --port=0 --use-host-proxy --without-browser-env-var --disable-websocket-compression --print-ip-address --enable-remote-auto-shutdown "$POLLING_ARGS" "$LOGGING_ARGS" "$@"

