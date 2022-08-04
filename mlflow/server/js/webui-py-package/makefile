.PHONY: *
.ONESHELL:
SHELL := /bin/bash

clean:
	rm -rf build dist pynb_dag_runner_webui.egg-info

build-wheel-file:
	make clean

	python3 setup.py bdist_wheel

	echo "=== Output files in ./dist directory: ==="
	find ./dist/
	echo "========================================="

build-wheel-file[in-docker]:
	cd docker
	make run-command[in-docker] \
	    DOCKER_ARGS=" \
	        --volume $$(pwd)/../:/webui-py-package \
	        --workdir /webui-py-package \
	    " \
	    DOCKER_COMMAND="make build-wheel-file"; \
