import {
  STATIC_EXPERIMENTS,
  STATIC_RUNS
} from './StaticData';


const one = (xs) => {
  if (xs.length === 1) {
    return xs[0];
  } else {
    throw new Error('Expected one result; found ${xs.length}')
  }
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
        STATIC_RUNS.filter((entry) => entry.info.run_id === run_id))
    }).then(xs => ({
      run: one(xs)
    }))
  }

  static listArtifacts({
    run_uuid,
    path
  }) {
    // TOOO: implement ARTEFACT_LIST_PER_STATIC_RUN etc with static hosted content
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

    const filteredRuns = STATIC_RUNS.filter(runEntry => experiment_ids.includes(runEntry.info.experiment_id));

    return new Promise((resolve, reject) => {
      resolve({
        runs: filteredRuns
      });
    });
  }
}
