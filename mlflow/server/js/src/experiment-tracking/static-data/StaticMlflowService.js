const LIST_EXPERIMENTS_API_STATIC_RESPONSE = {
  experiments: [{
      experiment_id: '0',
      name: 'Experiment #0',
      artifact_location: './mlruns/0',
      lifecycle_stage: 'active',
      tags: [{
        key: 'mlflow.note.content',
        value: 'Description shown when opening experiment page. #0',
      }, ],
    },
    {
      experiment_id: '1',
      name: 'My experiment #1',
      artifact_location: './mlruns/1',
      lifecycle_stage: 'active',
      tags: [{
        key: 'mlflow.note.content',
        value: 'Description shown when opening experiment page. #1',
      }, ],
    },
    {
      experiment_id: '2',
      name: 'Last experiment #2',
      artifact_location: './mlruns/2',
      lifecycle_stage: 'active',
    },
  ]
};


const ALL_RUNS = [{
    info: {
      run_uuid: "00000000000000000000000000000000",
      experiment_id: "0",
      user_id: "root",
      status: "FINISHED",
      start_time: 1645952322527,
      end_time: 1645952322545,
      artifact_uri: "/repo-root/backend/artefacts/0/00000000000000000000000000000000/artifacts",
      lifecycle_stage: "active",
      run_id: "00000000000000000000000000000000"
    },
    data: {
      tags: [{
          key: "mlflow.user",
          value: "root"
        },
        {
          key: "mlflow.source.name",
          value: "/path/to/my/main-file.py"
        },
        {
          key: "mlflow.source.type",
          value: "LOCAL"
        },
        {
          key: "mlflow.source.git.commit",
          value: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
        },
        {
          key: "mlflow.runName",
          value: "my-run-name"
        },
        {
          key: "foo",
          value: "bar"
        },
        {
          key: "mlflow.note.content",
          value: "this is a run description"
        }
      ]
    }
  },
  {
    info: {
      run_uuid: "00000000000000000000000000000111",
      experiment_id: "0",
      user_id: "root",
      status: "FINISHED",
      start_time: 1645952322527,
      end_time: 1645952322545,
      artifact_uri: "/repo-root/backend/artefacts/0/00000000000000000000000000000111/artifacts",
      lifecycle_stage: "active",
      run_id: "00000000000000000000000000000111"
    },
    data: {
      tags: [{
          key: "mlflow.user",
          value: "root"
        },
        {
          key: "mlflow.source.name",
          value: "/path/to/my/source-file.py"
        },
        {
          key: "mlflow.source.type",
          value: "LOCAL"
        },
        {
          key: "mlflow.source.git.commit",
          value: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
        },
        {
          key: "mlflow.parentRunId",
          value: "00000000000000000000000000000000"
        },
        {
          key: "mlflow.runName",
          value: "my-run-name"
        },
        {
          key: "foo",
          value: "bar"
        },
        {
          key: "mlflow.note.content",
          value: "this is a run description"
        }
      ]
    }
  }
];

const one = (xs) => {
  if (xs.length === 1) {
    return xs[0];
  } else {
    throw new Error('Expected one result; found ${xs.length}')
  }
};

export class StaticMlflowService {
  static listExperiments(dummy_arg) {
    return new Promise((resolve, reject) => resolve(LIST_EXPERIMENTS_API_STATIC_RESPONSE));
  };

  static getExperiment({
    experiment_id
  }) {
    return new Promise((resolve, reject) => {
      resolve(
        LIST_EXPERIMENTS_API_STATIC_RESPONSE
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
        ALL_RUNS.filter((entry) => entry.info.run_id === run_id))
    }).then(xs => ({
      run: one(xs)
    }))
  }

  static listArtifacts({
    run_uuid,
    path
  }) {
    return new Promise((resolve, reject) => resolve([]));
  }

  static searchRuns({
    experiment_ids,
    filter, // ignore for now (TODO?); eg. "", undefined
    run_view_type, // ignore, can be "ACTIVE_ONLY" or undefined
    max_results, // ignore
    order_by, // ignore for now (TODO); eg.  ["attributes.start_time DESC"]
    page_token, // assumed always NULL (max_results not respected)
  }) {
    if (!!page_token) {
      return new Promise((resolve, reject) => reject(new Error("Load more not supported in static mode.")));
    }

    const filteredRuns = ALL_RUNS.filter(runEntry => experiment_ids.includes(runEntry.info.experiment_id));

    return new Promise((resolve, reject) => {
      resolve({
        runs: filteredRuns
      });
    });
  }
}
