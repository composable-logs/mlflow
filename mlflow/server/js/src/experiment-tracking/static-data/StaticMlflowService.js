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

// eg. ["ingestion.py", "eda.py", "train.py", "evaluate.py"]
const TASK_SOURCE_NAMES = [...new Set(TASK_RUNID_TO_TASK_SOURCE_NAME.values())];

const LOOKUP_TASK_SOURCE_NAME_TO_IDX = new Map([...TASK_SOURCE_NAMES.entries()].map(([idx, x]) => [x, "" + idx]));
const LOOKUP_IDX_TO_TASK_SOURCE_NAME = new Map([...TASK_SOURCE_NAMES.entries()].map(([idx, x]) => ["" + idx, x]));

const _STATIC_EXPERIMENTS = () => {
  var experiments = [];

  TASK_SOURCE_NAMES.forEach(sourceName => {
    const experimentId = LOOKUP_TASK_SOURCE_NAME_TO_IDX.get(sourceName);
    experiments.push(
      {
        experiment_id: experimentId,
        name: sourceName,
        artifact_location: `./mlruns/${experimentId}`,
        lifecycle_stage: 'active',
        tags: [{
          key: 'mlflow.note.content',
          value: 'Task runs grouped by task name',
        },
        ],
      },
    );
  });

  return { experiments: experiments };
}

const STATIC_EXPERIMENTS = _STATIC_EXPERIMENTS()

const reformatEntry = (runId, entry) => {
  const sourceName = entry["metadata"]["attributes"]["task.notebook"];

  var isSucess = (entry.metadata.status && entry.metadata.status.status_code && (entry.metadata.status.status_code == "OK"));

  var result = {
    info: {
      run_uuid: runId,
      experiment_id: LOOKUP_TASK_SOURCE_NAME_TO_IDX.get(sourceName),
      user_id: "info.user_id",
      status: isSucess ? "FINISHED" : "FAILED",
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
        value: "LOCAL"
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
        value: "description missing"
      }
      ]
    }
  };

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
        { run: reformatEntry(run_id, STATIC_DATA[run_id]) }
      )
    });
  }

  static listArtifacts({
    run_uuid,
    path
  }) {
    // TOOO: implement ARTEFACT_LIST_PER_STATIC_RUN etc with static hosted content
    return new Promise((resolve, reject) => resolve([]));
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

    const validSources = new Set(experiment_ids.map(eid => LOOKUP_IDX_TO_TASK_SOURCE_NAME.get(eid)));

    // get parent Task id:s whose runs should be shown
    const taskIds = new Set(Object.entries(STATIC_DATA)
      .filter(([runId, v]) => v.type === "task")
      .filter(([runId, v]) => validSources.has(v["metadata"]["attributes"]["task.notebook"]))
      .map(([runId, v]) => runId)
    );

    // find all children (run:s) under these tasks
    const runs = [...Object.entries(STATIC_DATA)
      .filter(([runId, v]) => v.type === "run")
      .filter(([runId, v]) => taskIds.has(v["parent_id"]))
      .map(([runId, v]) => reformatEntry(runId, v))
    ];

    return new Promise((resolve, reject) => { resolve({ runs: runs }); });
  }
}
