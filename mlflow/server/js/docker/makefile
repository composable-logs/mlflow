.PHONY: *

DOCKER_IMAGE_NAME := node-14-x-docker-image

build-image:
	docker build \
	    --file Dockerfile \
	    --tag ${DOCKER_IMAGE_NAME} \
	    .

	@echo "--- Docker images:"
	@docker images

run[in-docker]:
	docker run \
	    --tty --rm \
	    ${DOCKER_ARGS} \
	    ${DOCKER_IMAGE_NAME} \
	    "${DOCKER_COMMAND}"
