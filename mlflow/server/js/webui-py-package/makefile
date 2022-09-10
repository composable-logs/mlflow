.PHONY: *
SHELL := /bin/bash

# Note: Tasks should be started is same directory as makefile

# # --- Helper tasks ---

env_%:
	@# Implict task dependency that fails if variable is not defined
	@#
	@# See, https://stackoverflow.com/a/7367903
	@#
	@if [[ -z "${$*}" ]]; then exit 1; fi

# --- Main tasks ---

clean:
	rm -rf build dist pynb_dag_runner_webui.egg-info

build-wheel: | env_PYTHON_PACKAGE_RELEASE_TARGET env_ASSETS_PATH
	@make clean

	@python3 setup.py bdist_wheel

	@echo "----------------- Output files in ./dist directory -----------------"
	@find ./dist/ -type f
	@echo "--------------------------------------------------------------------"

build-wheel[in-docker]: | env_PYTHON_PACKAGE_RELEASE_TARGET env_ASSETS_PATH
	(\
	    cd docker; \
	    make run[in-docker] \
	        DOCKER_ARGS=" \
	            -e PYTHON_PACKAGE_RELEASE_TARGET \
	            --volume $$(pwd)/../:/webui-py-package \
	            --volume ${ASSETS_PATH}:/assets \
	            --workdir /webui-py-package \
	        " \
	        DOCKER_COMMAND="( \
	            ASSETS_PATH='/assets' \
	            make build-wheel \
	        )"; \
	)
