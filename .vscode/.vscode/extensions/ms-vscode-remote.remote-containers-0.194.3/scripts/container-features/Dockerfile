ARG BASE_IMAGE=debian
FROM $BASE_IMAGE

USER root

#{containerEnv}

COPY library-scripts /tmp/library-scripts
COPY features.env /tmp/library-scripts/
RUN /bin/sh /tmp/library-scripts/install.sh \
    && rm -rf /tmp/library-scripts

ARG IMAGE_USER=root
USER $IMAGE_USER
