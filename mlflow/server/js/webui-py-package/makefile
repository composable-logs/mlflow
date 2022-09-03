.PHONY: *
SHELL := /bin/bash

# Note: Tasks should be started is same directory as makefile

clean:
	rm -rf build dist pynb_dag_runner_webui.egg-info

build-wheel-file:
	@make clean

	@python3 setup.py bdist_wheel

	@echo "----------------- Output files in ./dist directory -----------------"
	@find ./dist/ -type f
	@echo "--------------------------------------------------------------------"

set-assets:
	@echo "--- Setting assets to content in directory $(ASSETS_DIRECTORY) ..."
	@echo "--- Content:"
	@find $(ASSETS_DIRECTORY)

	@echo "--- Ensuring assets directory is empty"
	rm -rf ./assets
	mkdir assets

	@echo "--- Copying assets ..."
	cp -r $(ASSETS_DIRECTORY) ./assets/

build-wheel[in-docker]:
	(\
	    cd docker; \
	    make run[in-docker] \
	        DOCKER_ARGS=" \
	            --volume $$(pwd)/../:/webui-py-package \
	            --workdir /webui-py-package \
	        " \
	        DOCKER_COMMAND="( \
	            ASSETS_PATH='./assets' \
	            make build-wheel-file \
			)"; \
	)
