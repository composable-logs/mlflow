import {
  STATIC_DATA
} from './StaticData';


const one = (xs) => {
  if (xs.length === 1) {
    return xs[0];
  } else {
    throw new Error(`Expected one result; found ${xs.length}`);
  }
};

// map eg "0x11110000bbbbaaaa" -> "ingestion.py"
const TASK_RUNID_TO_TASK_SOURCE_NAME = new Map(
  Object.entries(STATIC_DATA)
    .filter(([k, v]) => v.type === "task")
    .map(([k, v]) => [k, v["metadata"]["attributes"]["task.notebook"]])
);

// List ML Flow experiments;
//  - 1st entry "All pipeline runs", list pipeline runs with task-runs as sub-entries
//  - after that list all notebooks eg ["ingestion.py", "eda.py", "train.py", "evaluate.py"]
const TASK_SOURCE_NAMES = ["All pipeline runs"].concat(
  [...new Set(TASK_RUNID_TO_TASK_SOURCE_NAME.values())]
);

const LOOKUP_TASK_SOURCE_NAME_TO_IDX = new Map([...TASK_SOURCE_NAMES.entries()].map(([idx, x]) => [x, "" + idx]));
const LOOKUP_IDX_TO_TASK_SOURCE_NAME = new Map([...TASK_SOURCE_NAMES.entries()].map(([idx, x]) => ["" + idx, x]));

const STATIC_EXPERIMENTS = (() => {
  var experiments = [];

  TASK_SOURCE_NAMES.forEach(sourceName => {
    const experimentId = LOOKUP_TASK_SOURCE_NAME_TO_IDX.get(sourceName);

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
          value: (experimentId === "0" ? pipelinesDescription : tasksDescription),
        },
        ],
      },
    );
  });

  return { experiments: experiments };
})();

// Array of ID:s for pipeline runs
const ALL_PIPELINE_RUN_IDS = [...Object.entries(STATIC_DATA)
  .filter(([runId, v]) => v.type === "pipeline")
  .map(([runId, v]) => runId)
];

const PIPELINE_ID_TO_CHILDREN_RUN_IDS = (() => (
  new Map(ALL_PIPELINE_RUN_IDS.map(pipelineId => {
    const result = [];

    Object.entries(STATIC_DATA).forEach(([vRunId, v]) => {
      if ((v.type === "task") && (v.parent_id === pipelineId)) {
        Object.entries(STATIC_DATA).forEach(([wRunId, w]) => {
          if ((w.type === "run") && (w.parent_id === vRunId)) {
            result.push(wRunId);
          }
        });
      }
    });
    return [pipelineId, result];
  }))
))();

const reformatEntry = (runId, entry, experimentId) => {
  const isPipeline = entry.type === "pipeline";

  var sourceName;
  if (isPipeline) {
    sourceName = "Pipeline run";
  } else {
    sourceName = entry["metadata"]["attributes"]["task.notebook"] || "Unknown"
  }

  const isSucess = (entry.metadata.status && entry.metadata.status.status_code && (entry.metadata.status.status_code == "OK"));

  const result = {
    info: {
      run_uuid: runId,
      experiment_id: (!!experimentId ? experimentId : LOOKUP_TASK_SOURCE_NAME_TO_IDX.get(sourceName)),
      user_id: "info.user_id",
      // TODO: pipelines-summaries should also have status in data
      // Now pipeline runs are always shown as successful (green icon) even
      // if they contain failed tasks
      status: (isPipeline || isSucess) ? "FINISHED" : "FAILED",
      start_time: entry.metadata.start_time,
      end_time: entry.metadata.end_time,
      artifact_uri: "artifact_uri",
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
        value: entry.type, // "pipeline", "task", or "run"
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
              const artifact_entries = entry.artifacts.filter((k) => k.file_name == filename);

              if (artifact_entries.length === 1) {
                return [
                  `# ${header}`,
                  `![${header}](./pipeline-artifacts/${one(artifact_entries).artifact_path})`
                ];
              } else {
                return [];
              }
            };
            return [
              ...addImage("DAG diagram of task dependencies in pipeline", "dag-diagram.png"),
              ...addImage("Gantt diagram of task runs in pipeline", "gantt-diagram.png")
            ].join("\n");
          } else {
            return "No description";
          }
        })()
      }
      ],
      params: [...Object.entries(entry.metadata.attributes)
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
  if (!!entry.metadata.logged_values) {
    const log_kv = (k, v) => {
      if (Number(v) !== v) {
        throw new Error(`Too complex logged value ${k}=${v}`);
      }

      result.data.metrics.push({
        key: k,
        value: v,
        // -- only one value --
        timestamp: entry.metadata.start_time,
        step: 0
      });
    };

    Object.entries(entry.metadata.logged_values).forEach(([k, v]) => {
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
        throw new Error(`Too complex logged value ${k}=${v}`);
      }
    });
  }

  if (entry.type === "run") {
    const parentTaskId = STATIC_DATA[runId].parent_id;
    result.data.tags.push({
      key: "mlflow.parentRunId",
      value: STATIC_DATA[parentTaskId].parent_id
    });
  }

  return result;
};

export class StaticMlflowService {
  static listExperiments(dummy_arg) {
    return new Promise((resolve, reject) => resolve(STATIC_EXPERIMENTS));
  };

  static getExperiment({
    experiment_id
  }) {
    return new Promise((resolve, reject) => {
      resolve(
        STATIC_EXPERIMENTS
          .experiments
          .filter((entry) => entry.experiment_id === experiment_id))
    }).then(xs => ({
      experiment: one(xs)
    }))
  }

  static getRun({
    run_id
  }) {
    return new Promise((resolve, reject) => {
      resolve(
        { run: reformatEntry(run_id, STATIC_DATA[run_id], null) }
      )
    });
  }

  static listArtifacts({
    run_uuid,
    path
  }) {
    const entry = STATIC_DATA[run_uuid];
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

    if ((experiment_ids.length === 1) && one(experiment_ids) === "0") {
      // Return all pipeline runs run individual runs as children

      result = [];
      for (const pipelineId of ALL_PIPELINE_RUN_IDS) {
        const pipelineEntry = reformatEntry(pipelineId, STATIC_DATA[pipelineId], "0")

        result.push(pipelineEntry);

        for (const childId of PIPELINE_ID_TO_CHILDREN_RUN_IDS.get(pipelineId)) {
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
          result.push(reformatEntry(childId, STATIC_DATA[childId], "0"));
        }
      }
    } else {
      const expId = one(experiment_ids); // will crash if searching for more experimentId:s

      const validSources = new Set(experiment_ids.map(eid => LOOKUP_IDX_TO_TASK_SOURCE_NAME.get(eid)));

      // get parent Task id:s whose runs should be shown
      const taskIds = new Set(Object.entries(STATIC_DATA)
        .filter(([runId, v]) => v.type === "task")
        .filter(([runId, v]) => validSources.has(v["metadata"]["attributes"]["task.notebook"]))
        .map(([runId, v]) => runId)
      );

      // find all children (run:s) under these tasks
      result = [...Object.entries(STATIC_DATA)
        .filter(([runId, v]) => v.type === "run")
        .filter(([runId, v]) => taskIds.has(v["parent_id"]))
        .map(([runId, v]) => reformatEntry(runId, v, expId))
      ];
    }

    return new Promise((resolve, reject) => { resolve({ runs: result }); });
  }
}
