.PHONY: *
SHELL := /bin/bash

# Note: Tasks should be started is same directory as makefile

# --- Task dependencies to check correct environment variables are set ---
#
# See setup.py for details.
_env_PYTHON_PACKAGE_RELEASE_TARGET:
ifndef PYTHON_PACKAGE_RELEASE_TARGET
$(error PYTHON_PACKAGE_RELEASE_TARGET not set)
endif

_env_ASSETS_PATH:
ifndef _env_ASSETS_PATH
$(error ASSETS_PATH not set)
endif

# ---

clean:
	rm -rf build dist pynb_dag_runner_webui.egg-info

build-wheel: | _env_PYTHON_PACKAGE_RELEASE_TARGET _env_ASSETS_PATH
	@make clean

	@python3 setup.py bdist_wheel

	@echo "----------------- Output files in ./dist directory -----------------"
	@find ./dist/ -type f
	@echo "--------------------------------------------------------------------"

build-wheel[in-docker]: | _env_PYTHON_PACKAGE_RELEASE_TARGET _env_ASSETS_PATH
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
