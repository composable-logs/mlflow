.PHONY: *

SHELL := /bin/bash
DOCKER_IMAGE_NAME := static-site-py-package

docker-build:
	@echo "=== Building Docker image for making Python package with compiled front end ==="
	docker \
	    build \
	    --file Dockerfile \
	    --build-arg HOST_UID=$$(id -u) \
	    --build-arg HOST_GID="$$(id -g)" \
	    --tag $(DOCKER_IMAGE_NAME) \
		.
docker-shell:
	docker run -it $(DOCKER_ARGS) $(DOCKER_IMAGE_NAME) /bin/bash
