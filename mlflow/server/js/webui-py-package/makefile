.PHONY: *
SHELL := /bin/bash

# Note: Tasks should be started is same directory as makefile

_release_target_env_is_set:
# Check that release target environment variable is set (as requisite
# for wheel build tasks)
ifndef PYTHON_PACKAGE_RELEASE_TARGET
$(error PYTHON_PACKAGE_RELEASE_TARGET not set)
endif

# ---

clean:
	rm -rf build dist pynb_dag_runner_webui.egg-info

build-wheel: | _release_target_env_is_set
	@make clean

	@python3 setup.py bdist_wheel

	@echo "----------------- Output files in ./dist directory -----------------"
	@find ./dist/ -type f
	@echo "--------------------------------------------------------------------"

build-wheel[in-docker]: | _release_target_env_is_set

# Task will build a wheel file containing all data assets in ASSETS_PATH.
# Check that this is set.
ifndef ASSETS_PATH
$(error ASSETS_PATH not set)
endif

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
