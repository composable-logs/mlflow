.PHONY: *
SHELL := /bin/bash

# Note: This should run in the same directory as the makefile

# --- Helper tasks ---

.env_%:
	@# Check that a variable is defined, see stackoverflow.com/a/7367903
	@if [[ -z "${$*}" ]]; then exit 1; fi

.clean:
	@echo "--- Cleaning all output build folders for 'composable_logs_webui' ..."
	rm -rf build dist composable_logs_webui.egg-info

# --- Main tasks ---

build-wheel: | .env_PYTHON_PACKAGE_RELEASE_TARGET .env_ASSETS_PATH
	@python3 setup.py bdist_wheel

	@echo "----------------- Output files in ./dist directory -----------------"
	@find ./dist/ -type f
	@echo "--------------------------------------------------------------------"

build-wheel[in-docker]: | .env_PYTHON_PACKAGE_RELEASE_TARGET .env_ASSETS_PATH .clean
	(\
	    cd docker; \
	    make run[in-docker] \
	        DOCKER_ARGS=" \
	            -e PYTHON_PACKAGE_RELEASE_TARGET \
	            --volume $$(pwd)/../:/webui-py-package \
	            --volume $$(pwd)/../../../../..:/repo-root:ro \
	            --volume ${ASSETS_PATH}:/assets:ro \
	            --workdir /webui-py-package \
	        " \
	        DOCKER_COMMAND="( \
	            ASSETS_PATH='/assets' \
	            README_FILEPATH='/repo-root/README.md' \
	            make build-wheel \
	        )"; \
	)
