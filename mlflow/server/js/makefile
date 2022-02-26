# The below commands can be run inside image build with ML Flow repo root Dockerfile

start-backend:
	# This also serves the default ML Flow UI on port 5000

	#rm -rf mlflow/mlruns
	mlflow server --host 0.0.0.0 --port 5000 --gunicorn-opts '--log-level debug'

populate-backend:
	# Populate backend with test experiment data (but no artefacts)
	(\
	    MLFLOW_TRACKING_URI=http://127.0.0.1:5000; \
	    python3 /repo-root/tests/generate_ui_test_data.py \
	)

watch-ui:
	# Run "npm install" before this

	# There are various env-settings in package.json for "npm start-web";
	#
	# -----------------------------
	# --- React app settings ---
	# - SERVE_WEBAPP, PORT;
	#
	# --- Front end customization ---
	# - HIDE_HEADER=true/false;
	#      Show top header with logo and Github link?
	# - HIDE_EXPERIMENT_LIST;
	#      Seems unstable. Setting to True leads to "No Experiments Exist"
	# - SHOW_GDPR_PURGING_MESSAGES;
	#      Display comment when deleting experiments
	#
	# --- Frontend/backend communication ---
	# - USE_ABSOLUTE_AJAX_URLS=true/false
	#     How to form URLS for backend calls
	#
	# --- Not used (?) ---
	# - SHOULD_REDIRECT_IFRAME
	#
	# -----------------------------
	(\
	    PORT=3001 \
	    HIDE_HEADER=false \
	    npm start \
	)

	# ---
	# Note: sometimes, it is necessary to kill the UI server. The below can
	# be used to kill process(es) listening on a port eg 3001. But, this may crash
	# VS Code if running a dev-container setup.
	#apt install -y lsof
	#kill -9 $(lsof -i:3001 -t)
