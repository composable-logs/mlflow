SHELL := /bin/bash
DOCKER_IMAGE_NAME := ui-asset-wheel-builder-docker-image

$(DOCKER_IMAGE_NAME): Dockerfile
	docker \
	    build \
	    --file Dockerfile \
	    --build-arg HOST_UID=$$(id -u) \
	    --build-arg HOST_GID="$$(id -g)" \
	    --tag $(DOCKER_IMAGE_NAME) \
	    .

	touch $@

build-image: $(DOCKER_IMAGE_NAME)

run[in-docker]: $(DOCKER_IMAGE_NAME)
	docker run --rm \
	    --tty $(DOCKER_ARGS) \
	    $(DOCKER_IMAGE_NAME) \
	    "$(DOCKER_COMMAND)"
