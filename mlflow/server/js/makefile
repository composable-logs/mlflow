.PHONY: *

SHELL := /bin/bash

# Note:
# All commands should be executed in the same directory as this makefile.
MAKEFILE_PATH := $(shell pwd)

# --- helper tasks ---

.clean-build-folder:
	@echo "--- Cleaning build folder with compiled static UI assets ..."
	rm -rf build

.npm-install:
	@echo "--- Installing dependencies ..."
	time npm install


# --- dev related tasks (for interactive development)
#
# All of these might no longer be needed. However, initially these were
# useful to better understand how the front end communicates with the
# backend API, and how the MLFlow data is stored in SQL.
#

dev/start-backend:
	# clear any old experiments/artifacts
	rm -rf /repo-root/mlflow/mlruns

	(\
	    cd /repo-root/; \
	    rm -rf /repo-root/backend; \
	    mkdir -p /repo-root/backend/artifacts; \
	    mlflow server \
	        --backend-store-uri sqlite:////repo-root/backend/sqlite.db \
	        --default-artifact-root /repo-root/backend/artifacts/ \
	        --host 0.0.0.0 \
	        --port 5000 \
	        --gunicorn-opts '--log-level debug' \
	)

dev/populate-backend-with-test-data:
	# Populate backend with test experiment data (but no artifacts)
	(\
	    MLFLOW_TRACKING_URI=http://127.0.0.1:5000 \
	    python3 /repo-root/tests/generate_ui_test_data.py \
	)

dev/start-sqlite-web-ui:
	# start web ui for inspecting ML Flow backend database schema and data
	pip3 install sqlite-web==0.4.0
	sqlite_web --port 5012 /repo-root/backend/sqlite.db

dev/serve-static-ui-in-watch-mode: | .clean-build-folder .npm-install
	# Serve static website in watch mode on localhost:3010
	#
	# There are various env-settings in package.json for "npm start-web";
	#
	# -----------------------------
	# --- React app settings ---
	# SERVE_WEBAPP
	# PORT
	#
	# --- Front end customization ---
	# HIDE_HEADER
	#      Show top header with logo and Github link?
	#      Note, header hidden if flag is defined. Eg.,
	#      "HIDE_HEADER=false" will hide header.
	#
	# HIDE_EXPERIMENT_LIST
	#      Seems unstable? Setting leads to "No Experiments Exist"
	#
	# SHOW_GDPR_PURGING_MESSAGES
	#      Display comment when deleting experiments
	#
	# --- Frontend/backend communication ---
	# USE_ABSOLUTE_AJAX_URLS=true/false
	#     How to form URLS for backend calls
	#
	# --- Not used (?) ---
	# SHOULD_REDIRECT_IFRAME
	#
	# --- Static version of ML Flow ---
	# HOST_STATIC_SITE
	#    set to "true" for hosting static (read only) version of ML Flow
	# -----------------------------
	(\
	    PORT=3010 \
	    HOST_STATIC_SITE=true \
	    npm start \
	)

dev/serve-static-ui-in-watch-mode[in-docker]:
	( \
	    cd docker; \
	    make run[in-docker] \
	        DOCKER_ARGS=" \
	            --volume ${MAKEFILE_PATH}:/mlflow-server-js \
	            --workdir /mlflow-server-js \
	            --publish 3010:3010 \
	        " \
	        DOCKER_COMMAND=" \
	            make dev/serve-static-ui-in-watch-mode; \
	        "; \
	)

# --- tasks building static UI assets ---

build-static-ui-assets: | .clean-build-folder .npm-install
	@echo "--- Compiling static assets for web UI ..."
	HOST_STATIC_SITE=true npm run build

	@echo "--- Content and size of ./build-folder"
	tree --du -h --sort=size build

build-static-ui-assets[in-docker]:
	( \
	    cd docker; \
	    make run[in-docker] \
	        DOCKER_ARGS=" \
	            --volume ${MAKEFILE_PATH}:/mlflow-server-js \
	            --workdir /mlflow-server-js \
	        " \
	        DOCKER_COMMAND=" \
	            make build-static-ui-assets; \
	        "; \
	)

# --- 'webui-py-package' tasks ---
# Tasks to build Python package with compiled static website assets.

webui-py-package/docker/build-image:
	@(cd webui-py-package/docker; make build-image)

webui-py-package/build-wheel[in-docker]:
	@# This command assumes that the ./build folder contains the compiled assets
	@# and these are included in the Python package.
	(\
	    cd webui-py-package; \
	    make build-wheel[in-docker] \
	        ASSETS_PATH=${MAKEFILE_PATH}/build/.; \
	)
