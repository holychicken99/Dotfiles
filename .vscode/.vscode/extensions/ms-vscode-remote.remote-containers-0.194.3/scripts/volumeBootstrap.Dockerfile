FROM alpine:3.13.2

RUN apk add --no-cache \
	nodejs \
	git \
	openssh-client \
	docker-cli \
	docker-compose \
	bash \
	;
