import { getArtifactContent } from '../../common/utils/ArtifactUtils'

const one = (xs) => {
  if (xs.length === 1) {
    return xs[0];
  } else {
    throw new Error(`Expected one result; found ${xs.length}`);
  }
};

const reformatEntry = (runId, entry, experimentId) => {
  const isPipeline = entry.type === "workflow";

  // For tasks, is this Python or Jupytext task?
  // For workflow, "-"
  var runName;

  // task-id
  var sourceName;

  if (isPipeline) {
    sourceName = "";
    runName = "workflow"
  } else {
    sourceName = entry["attributes"]["task.id"] || "Unknown";
    runName = entry["attributes"]["task.type"] || "Unknown"
  }

  const result = {
    info: {
      run_uuid: runId,
      experiment_id: (!!experimentId ? experimentId : StaticDataLoader.LOOKUP_TASK_SOURCE_NAME_TO_IDX.get(sourceName)),
      user_id: "info.user_id",
      status: entry.is_success ? "FINISHED" : "FAILED",
      // Convert ISO8601 to unix epoch [ms]
      start_time: new Date(entry.timing_start_iso8601).getTime(),
      end_time: new Date(entry.timing_end_iso8601).getTime(),
      // asset directory structure could be included in JSON to keep control in one place
      artifact_uri: `artifacts/${entry.type}/${runId}`,
      lifecycle_stage: "active",
      run_id: runId
    },
    data: {
      tags: [{
        key: "mlflow.user",
        value: "unknown user"
      },
      {
        key: "mlflow.source.name",
        value: sourceName
      },
      {
        key: "mlflow.source.type",
        value: isPipeline ? "PROJECT" : "NOTEBOOK"
      },
      {
        key: "mlflow.source.git.commit",
        value: "unknown git commit"
      },
      {
        key: "mlflow.runName",
        value: runName
      },
      // extra top keys are shown in main UI list of runs
      {
        key: "top-key",
        value: "123"
      },
      {
        key: "mlflow.note.content",
        value: (() => {
          // -- determine description --
          if (isPipeline && !!entry.artifacts) {
            const addImage = (header, filename) => {
              const artifact_entries = entry.artifacts.filter((k) => k.name === filename);

              if (artifact_entries.length === 1) {
                return [
                  `# ${header}`,
                  `![${header}](./workflow-artifacts/${entry.artifacts_location}/${filename})`
                ];
              } else {
                return [];
              }
            };
            return [
              ...addImage("DAG diagram of task dependencies in this workflow", "dag-diagram.png"),
              ...addImage("Gantt diagram of task runs in workflow", "gantt-diagram.png")
            ].join("\n");
          } else {
            return "No description";
          }
        })()
      }
      ],
      params: [...Object.entries(entry.attributes)
        .map(([k, v]) => ({ key: k, value: v }))
      ],
      metrics: []
    }
  };

  // --- add logged metrics ---
  // The complexity of the below code is due to our Python interface
  // allows logging of arbitrary dicts/arrays, but MLFlow only allow
  // numeric metrics.
  //
  // Also, this only keeps track of *one value* for the metric; ie.
  // this does not support logging a loss function during training.
  if (!!entry.logged_values) {
    const log_kv = (k, v) => {
      if (Number(v) !== v) {
        console.log(`Skipping too complex logged value ${k}=${v}`);
        return;
      }

      result.data.metrics.push({
        key: k,
        value: v,
        // -- only one value --
        timestamp: entry.start_time_epoch_us / 1000,
        step: 0
      });
    };

    Object.entries(entry.logged_values).forEach(([k, v]) => {
      if ((v.type === "int") || (v.type === "float")) {
        log_kv(k, v.value);
      } else if ((v.type === "json") && Array.isArray(v.value)) {
        for (const [idx, x] of v.value.entries()) {
          log_kv(k + "." + idx, x);
        }
      } else if (v.type === "json") {
        for (const [idx, x] of Object.entries(v.value)) {
          log_kv(k + "=" + idx, x);
        }
      } else {
        console.log(`Skipping too complex logged value ${k}=${v}`);
      }
    });
  }

  if (entry.type === "task") {
    result.data.tags.push({
      key: "mlflow.parentRunId",
      value: StaticDataLoader.DATA.get(runId).parent_span_id
    });
  }

  return result;
};

class StaticDataLoaderClass {
  // -- static data to show in UI --
  DATA;
  ALL_PIPELINE_RUN_IDS;
  PIPELINE_ID_TO_CHILDREN_RUN_IDS;
  LOOKUP_IDX_TO_TASK_SOURCE_NAME;
  LOOKUP_TASK_SOURCE_NAME_TO_IDX;
  STATIC_EXPERIMENTS;
  ALL_PIPELINE_RUNS_ID = "all-workflow-runs";

  // promise (for attaching callbacks)
  loaderPromise;

  // undefined -> "LOADING" -> {"LOADED" or "FAILED"}
  state;

  constructor() {
    this.loaderPromise = getArtifactContent('static_data.json');

    //
    // Note:
    // Before data has been loaded, the UI will just be a load-screen like:
    //
    //     "Please wait. Loading ..."
    //
    // However, the main MLFlow UI will still start to initialize and it
    // will start to query data immediately. Thus, before data has arrived
    // we initially just return "no data" (and we do not attempt to hide/disable
    // the main UI while data is loading).
    //
    this.registerData("LOADING", []);

    this.loaderPromise.then((value) => {
      this.registerData("LOADED", JSON.parse(value));
    }).catch((err) => {
      this.registerData("FAILED", []);
    });
  }

  registerData(state, staticData) {
    this.state = state;

    this.ALL_PIPELINE_RUN_IDS = (staticData
      .filter((e) => e.type === "workflow")
      .map((e) => e.span_id)
    );

    this.PIPELINE_ID_TO_CHILDREN_RUN_IDS = (() => (
      new Map(this.ALL_PIPELINE_RUN_IDS.map(pipelineId => {
        const result = [];

        staticData.forEach((e) => {
          if ((e.type === "task") && (e.parent_span_id === pipelineId)) {
            result.push(e.span_id);
          }
        });
        return [pipelineId, result];
      }))
    ))();

    /**
     * LOOKUP_IDX_TO_TASK_SOURCE_NAME:
     *
     *   "all-workflow-runs" -> "All workflow runs"
     *   "benchmark-model" -> "notebooks/benchmark-model.py"
     *   ...
     */
    this.LOOKUP_IDX_TO_TASK_SOURCE_NAME = (() => {
      const result1 = new Map();
      result1.set(this.ALL_PIPELINE_RUNS_ID, "All workflow runs");

      const result2 = new Map();
      (staticData
        .filter((entry) => entry.type === "task")
        .forEach((entry) => {
          const entryExperimentId = entry.task_id;
          if (!result2.has(entryExperimentId)) {
            result2.set(entryExperimentId, entry["attributes"]["task.id"]);
          }
        })
      );

      // Note: keys/values in Maps are ordered in order of insertion.

      // Sort by task names
      // See: https://stackoverflow.com/a/51242261
      const result2Sorted = new Map([...result2].sort(([k1, v1], [k2, v2]) => v1 >= v2))

      return new Map([...result1, ...result2Sorted]);
    })();

    // LOOKUP_TASK_SOURCE_NAME_TO_IDX = inverse of the previous map.
    this.LOOKUP_TASK_SOURCE_NAME_TO_IDX = new Map(
      [...this.LOOKUP_IDX_TO_TASK_SOURCE_NAME.entries()].map(([k, v]) => [v, k])
    );

    this.STATIC_EXPERIMENTS = (() => {
      var experiments = [];

      for (const [experimentId, sourceName] of this.LOOKUP_IDX_TO_TASK_SOURCE_NAME.entries()) {
        const tasksDescription = "Task runs grouped by task name";
        const pipelinesDescription = "List of pipeline runs with task-runs as sub-entries";

        experiments.push(
          {
            experiment_id: experimentId,
            name: sourceName,
            artifact_location: `./mlruns/${experimentId}`,
            lifecycle_stage: 'active',
            tags: [{
              key: 'mlflow.note.content',
              value: (experimentId === this.ALL_PIPELINE_RUNS_ID ? pipelinesDescription : tasksDescription),
            },
            ],
          },
        );
      }

      return { experiments };
    })();

    this.DATA = new Map([...staticData.map((entry) => [entry.span_id, entry])]);
  }
}

export const StaticDataLoader = new StaticDataLoaderClass();

export class StaticMlflowService {
  static listExperiments(dummy_arg) {
    return new Promise((resolve, reject) => resolve(StaticDataLoader.STATIC_EXPERIMENTS));
  };

  static getExperiment({
    experiment_id
  }) {
    return new Promise((resolve, reject) => {
      resolve(
        StaticDataLoader.STATIC_EXPERIMENTS
          .experiments
          .filter((entry) => entry.experiment_id === experiment_id))
    }).then(xs => ({
      experiment: one(xs)
    }))
  }

  static getRunRawData(run_id) {
    return StaticDataLoader.DATA.get(run_id);
  }

  static getRun({
    run_id
  }) {
    return new Promise((resolve, reject) => {
      resolve(
        {
          run: reformatEntry(
            run_id, StaticMlflowService.getRunRawData(run_id), null)
        }
      )
    });
  }

  static listArtifacts({
    run_uuid,
    path
  }) {
    const entry = StaticMlflowService.getRunRawData(run_uuid);
    var result;

    if (!!entry && !!entry.artifacts) {
      // return all files with directories expanded
      result = {
        "root_uri": "/path/to/somewhere/",
        "files": [...entry.artifacts.map((entry) => ({
          path: entry.name,
          is_dir: false,
          file_size: entry.size
        }))]
      };
    } else {
      result = {
        root_uri: null,
        files: []
      };
    }
    return new Promise((resolve, reject) => resolve(result));
  }

  static searchRuns({
    experiment_ids, // see valid id:s in STATIC_EXPERIMENTS
    filter, // ignore for now (TODO?); eg. "", undefined
    run_view_type, // ignore, can be "ACTIVE_ONLY" or undefined
    max_results, // ignore
    order_by, // ignore for now (TODO); eg.  ["attributes.start_time DESC"]
    page_token, // assumed always NULL (max_results not respected)
  }) {
    if (!!page_token) {
      return new Promise((resolve, reject) => reject(new Error("Load more not supported in static mode.")));
    }

    var result;

    if ((experiment_ids.length === 1) && one(experiment_ids) === StaticDataLoader.ALL_PIPELINE_RUNS_ID) {
      // Return all pipeline runs with individual task runs as children

      result = [];
      for (const pipelineId of StaticDataLoader.ALL_PIPELINE_RUN_IDS) {
        const pipelineEntry = reformatEntry(
          pipelineId,
          StaticMlflowService.getRunRawData(pipelineId),
          StaticDataLoader.ALL_PIPELINE_RUNS_ID
        );

        result.push(pipelineEntry);

        for (const childId of StaticDataLoader.PIPELINE_ID_TO_CHILDREN_RUN_IDS.get(pipelineId)) {
          // Note: here we are rewriting the ExperimentId for run:s when shown in
          // "All Experiment" list. Otherwise, they will not show up in UI.
          //
          // This seems to work, but might not be ideal. If ML Flow front would
          // cache experiment details by runID, this could break since details for
          // one runID might have different experimentId dependening on where the
          // details are shown (in list, or run details page).
          //
          // A solution would be to preface runID:s with prefix depending on use,
          // like eg. "list-<run-id>" and "exp-<run-id>", but this also seems to
          // work.
          result.push(
            reformatEntry(
              childId,
              StaticMlflowService.getRunRawData(childId),
              StaticDataLoader.ALL_PIPELINE_RUNS_ID
            )
          );
        }
      }
    } else {
      const expId = one(experiment_ids); // will crash if searching for more experimentId:s
      // eg expId="eda", "summary"

      // find runs with this source
      result = ([...StaticDataLoader.DATA.entries()]
        .filter(([runId, v]) => v.type === "task")
        .filter(([runId, v]) => v.task_id === expId)
        .map(([runId, v]) => reformatEntry(runId, v, expId))
      );
    }

    return new Promise((resolve, reject) => { resolve({ runs: result }); });
  }
}
