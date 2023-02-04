FROM ubuntu:20.04

# Docker file for dev+build environment for modified MLFlow UI

# Notes:
# - git needed to install "json-bigint" package directly from the
#   databricks/json-bigint github repo.
# - The ca-cert package is needed by curl; see
#   https://stackoverflow.com/questions/3160909
#
# The below installs Node.JS version 14.19. This is based on:
#  - mlflow repo root Dockerfile; \
#  - https://github.com/nodesource/distributions#debinstall; \
#

ENV DEBIAN_FRONTEND "noninteractive"

RUN apt-get update --quiet -y && \
    apt-get install --no-install-recommends --quiet -y \
        make \
        curl \
        git \
        tree \
        time \
        ca-certificates && \
    curl -fsSL https://deb.nodesource.com/setup_14.x | bash - && \
    apt-get update --quiet -y && \
    apt-get install --quiet -y nodejs

ENTRYPOINT ["/bin/bash", "-c"]
