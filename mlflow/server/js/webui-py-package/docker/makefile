SHELL := /bin/bash

DOCKER_IMAGE_NAME       := ui-asset-wheel-builder

# file with time stamp to record when image was built
DOCKER_IMAGE_BUILD_FILE := .docker-image-build-times/${DOCKER_IMAGE_NAME}

# --- helper task ---

${DOCKER_IMAGE_BUILD_FILE}: Dockerfile
	docker \
	    build \
	    --file Dockerfile \
	    --build-arg HOST_UID=$$(id -u) \
	    --build-arg HOST_GID="$$(id -g)" \
	    --tag ${DOCKER_IMAGE_NAME} \
	    .

	mkdir -p $$(dirname $@)
	touch $@

	@echo "--- Docker images:"
	@docker images

# --- main tasks ---

build-image: ${DOCKER_IMAGE_BUILD_FILE}

run[in-docker]: ${DOCKER_IMAGE_BUILD_FILE}
	docker run --rm \
	    --tty ${DOCKER_ARGS} \
	    ${DOCKER_IMAGE_NAME} \
	    "${DOCKER_COMMAND}"
