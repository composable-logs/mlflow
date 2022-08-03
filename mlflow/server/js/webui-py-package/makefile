.PHONY: *
SHELL := /bin/bash

clean:
	rm -rf build dist pynb_dag_runner_static_ui.egg-info

build-wheel-file:
	make clean

	python3 setup.py bdist_wheel

	#unzip -l dist/*.whl
