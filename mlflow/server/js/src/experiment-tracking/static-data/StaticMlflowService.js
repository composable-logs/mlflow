const LIST_EXPERIMENTS_API_STATIC_RESPONSE = {
    experiments: [
      {
        experiment_id: '0',
        name: 'Experiment #0',
        artifact_location: './mlruns/0',
        lifecycle_stage: 'active',
        tags: [
          {
            key: 'mlflow.note.content',
            value: 'Description shown when opening experiment page. #0',
          },
        ],
      },
      {
        experiment_id: '1',
        name: 'My experiment #1',
        artifact_location: './mlruns/1',
        lifecycle_stage: 'active',
        tags: [
          {
            key: 'mlflow.note.content',
            value: 'Description shown when opening experiment page. #1',
          },
        ],
      },
      {
        experiment_id: '2',
        name: 'runs-but-no-metrics-params',
        artifact_location: './mlruns/2',
        lifecycle_stage: 'active',
      },
    ],
  };

export class StaticMlflowService {
  static listExperiments(_) {
    return new Promise((resolve, reject) => resolve(LIST_EXPERIMENTS_API_STATIC_RESPONSE));
  };

  static getExperiment({ experiment_id }) {
    return new Promise((resolve, error) => {
      const results = (
        LIST_EXPERIMENTS_API_STATIC_RESPONSE
          .experiments
          .filter((entry) => entry.experiment_id === experiment_id)
        );

      if (results.length === 1) {
        resolve({experiment: results[0]});
      } else {
        error(new Error('No (unique) data found for experiment {experimentId}'));
      }
    });
  }
}
