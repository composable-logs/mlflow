SHELL := /bin/bash
DOCKER_IMAGE_NAME := img-build-webui-py-package

_docker_image: Dockerfile
	docker \
	    build \
	    --file Dockerfile \
	    --build-arg HOST_UID=$$(id -u) \
	    --build-arg HOST_GID="$$(id -g)" \
	    --tag $(DOCKER_IMAGE_NAME) \
	    .

	touch $@

run[in-docker]: _docker_image
	docker run --rm \
	    --tty $(DOCKER_ARGS) \
	    $(DOCKER_IMAGE_NAME) \
	    "$(DOCKER_COMMAND)"
