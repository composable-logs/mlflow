.PHONY: *

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

dev/serve-static-ui-in-watch-mode:
	# Run "npm install" before this

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

	# ---
	# Note: sometimes it is necessary to kill the UI server. The below can
	# be used to kill process(es) listening on a port eg 3001. But, this may crash
	# VS Code if running a dev-container setup.
	#apt install -y lsof
	#kill -9 $(lsof -i:3001 -t)

dev/serve-static-ui-in-watch-mode[in-docker]:
	# Docker:ized version of "watch-ui"-task.
	# This must be executed in the same directory as this makefile.
	#
	# the below will install npm packages in mounted directory first time run
	#
	# Static website served in watch mode on localhost:3010
	docker run -it --rm \
	    --volume $$(pwd):/mlflow-server-js \
	    --publish 3010:3010 \
	    ui_build_image \
	    bash -c "( \
	        cd /mlflow-server-js/; \
	        time npm install; \
	        make dev/serve-static-ui-in-watch-mode; \
	    )"

# --- tasks building static UI assets ---

build-static-ui:
	# should run in the same directory as this makefile
	@echo "--- Cleaning build folder ..."
	rm -rf build
	@echo "--- Compiling UI ..."
	time HOST_STATIC_SITE=true npm run build

	@echo "--- Locatation of ./build folder: ($$(pwd))"
	@echo "--- Content and size of ./build-folder"
	find build
	du -hs build/*

docker-build-image-for-build-static-ui:
	docker build -f Dockerfile -t ui_build_image .

docker-build-static-ui:
	# Docker:ized version of "build-static-ui"-task.
	# This must be executed in the same directory as this makefile.

	# the below will install npm packages in mounted directory first time run
	docker run -t --rm \
	    --volume $$(pwd):/mlflow-server-js \
	    ui_build_image \
	    bash -c "( \
	        cd /mlflow-server-js/; \
	        time npm install; \
	        time make build-static-ui; \
	    )"

# --- 'webui-py-package' ---
# Tasks to build Python package with compiled static website assets.

webui-py-package/docker/build-image:
	(cd webui-py-package/docker; make build-image)

webui-py-package/build-wheel-file[in-docker]:
	(cd webui-py-package; make build-wheel-file[in-docker])
