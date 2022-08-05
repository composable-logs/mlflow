.PHONY: *

SHELL := /bin/bash
DOCKER_IMAGE_NAME := img-build-webui-py-package

build-image:
	@# Eg. DOCKER_ARGS="--no-cache" to force rebuild

	docker \
	    build \
	    $(DOCKER_ARGS) \
	    --file Dockerfile \
	    --build-arg HOST_UID=$$(id -u) \
	    --build-arg HOST_GID="$$(id -g)" \
	    --tag $(DOCKER_IMAGE_NAME) \
	    .

run-command[in-docker]:
	@# Note: In the below, quotes are needed if DOCKER_COMMAND contains spaces.
	@# There might be better ways also?

	docker run --rm \
	    --tty $(DOCKER_ARGS) \
	    $(DOCKER_IMAGE_NAME) \
	    "$(DOCKER_COMMAND)"
