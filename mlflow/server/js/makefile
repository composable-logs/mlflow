# The below commands can be run inside image build with ML Flow repo root Dockerfile

start-backend:
	# clear any old experiments/artefacts
	rm -rf /repo-root/mlflow/mlruns

	(\
	    cd /repo-root/; \
	    rm -rf /repo-root/backend; \
		mkdir -p /repo-root/backend/artefacts; \
	    mlflow server \
	        --backend-store-uri sqlite:////repo-root/backend/sqlite.db \
	        --default-artifact-root /repo-root/backend/artefacts/ \
	        --host 0.0.0.0 \
	        --port 5000 \
	        --gunicorn-opts '--log-level debug' \
	)

populate-backend:
	# Populate backend with test experiment data (but no artefacts)
	(\
	    MLFLOW_TRACKING_URI=http://127.0.0.1:5000 \
	    python3 /repo-root/tests/generate_ui_test_data.py \
	)

watch-ui:
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
	    PORT=3001 \
	    HOST_STATIC_SITE=true \
	    npm start \
	)

	# ---
	# Note: sometimes it is necessary to kill the UI server. The below can
	# be used to kill process(es) listening on a port eg 3001. But, this may crash
	# VS Code if running a dev-container setup.
	#apt install -y lsof
	#kill -9 $(lsof -i:3001 -t)

start-sqlite-web-ui:
	pip3 install sqlite-web==0.4.0
	sqlite_web --port 5012 /repo-root/backend/sqlite.db

build-static-ui:
	# Node.js v14.19.0 depedency, see repo root Docker file
	# add requires "npm install"
	rm -rf build
	HOST_STATIC_SITE=true npm run build
