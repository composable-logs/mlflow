**This repository contains a modified version of ML Flow.**
**The modified version can be hosted as a static website.**

<div align="center">

  <!-- 
    -- Need an empty line above: https://stackoverflow.com/a/70293384 
    -- First <a href>..</a> also should be on one line
    -->
  <a href="https://github.com/pynb-dag-runner/mlflow#license">![license=apache2](https://img.shields.io/github/license/pynb-dag-runner/mlflow?style=flat-square)</a>
  <a href="https://github.com/pynb-dag-runner/mlflow/actions/workflows/cicd_main-release.yml">
    ![ci/cd: main release to PyPI](https://github.com/pynb-dag-runner/mlflow/actions/workflows/cicd_main-release.yml/badge.svg)
  </a>
  <a href="https://pypi.org/project/pynb-dag-runner-webui/">
    ![PyPI version](https://badge.fury.io/py/pynb-dag-runner-webui.svg)
  </a>

</div>

## Motivation: Static hosting of MLFlow

The usual MLFlow front end (for experiment tracking) relies on a backend API for querying results about past experiments.

The modified MLFlow project in this repo is part of the `pynb-dag-runner` project.
This makes it possible to run data/ml pipelines on serverless/ephemeral infrastructure.
That is, it makes possible to track and report on experiments without a backend API or SQL database.
A typical use case is to run pipelines on CI/CD infrastructure.

The modified version of MLFlow in this repo loads all data from a static JSON file, and static assets (like images) are loaded separately.
Thus, deploying the modified MLFlow UI only requires only static web hosting.

**[Main project documentation](https://pynb-dag-runner.github.io/pynb-dag-runner/)**

## Live demo

- Example deployment on Github Pages: https://pynb-dag-runner.github.io/mnist-digits-demo-pipeline/

- Screenshot:

  [![Screenshot](https://pynb-dag-runner.github.io/pynb-dag-runner/live-demos/mnist-digits-demo-pipeline/screenshot-task-list.png)](https://pynb-dag-runner.github.io/mnist-digits-demo-pipeline/)

- This demo is a task and experiment tracker for an mnist-digits ML training pipeline scheduled to run daily.
  It uses no cloud infrastructure except services on Github (Github actions for compute, Build artifacts for storage, and Github Pages for reporting).

## Repo structure

Even if `pynb-dag-runner` only uses a small part of the entire ML Flow project (that is, the experiment tracking UI), the directory structure of MLFlow repo has been modified as little as possible.

- The original Github and Circleci actions have been disabled in this fork (the relevant directories are renamed to `disabled--{circleci, github-actions}`).
- New Github actions are in the `.github` directory.

Root directory for MLFlow front end codes:
[mlflow/mlflow/server/js/](https://github.com/pynb-dag-runner/mlflow/tree/static_mlflow/mlflow/server/js/)

### Main branches in this repo
- `master`: MLFlow original history up to 2/2022 (commit `2078937040654cf79d7c4c065f994ba537568561`) when the repo was forked.
- `static_mlflow`: branch with all modifications.
- The pull request [PR2](https://github.com/pynb-dag-runner/mlflow/pull/2) show the changes between these branches.

## Release process

- Triggered on updates to the file `mlflow/mlflow/server/js/webui-py-package/PYTHON_PACKAGE_VERSION`
- On release:
  - The React Javascript frontend is compiled and the static assets are published as a Python package (see below).
  - The published commit is tagged with `static-v<release version>`.
    The version is taken from first line in `PYTHON_PACKAGE_VERSION` file.
- Tags of form `v1.2.3` refer to original MLFlow releases.

For details, see the Github actions in this repo.

## Installation

Install as Python package hosted on [PyPI](https://pypi.org/project/pynb-dag-runner-webui/):

```bash
pip install pynb-dag-runner-webui --target /where/to/install
```

After installation the static assets for the modified MLFlow UI are in the directory `/where/to/install/assets`.

## Could this be merged into ML Flow?

Unlikely without significant refactorings.

- Most modifications (but not all) are behind the feature flag `HOST_STATIC_SITE`.
- The unit tests have not been updated.
- Due to large number of changes, merging the current modifications might not make sense.
  It would complicate the main code base for an edge use case.
- The MLFlow repo contain an open and inactive feature request from ["Freeze" experiments in ui to static html site](https://github.com/mlflow/mlflow/issues/4645) (8/2021).

## License

Original MLFlow project copyright Databricks 2018 and distributed under the Apache 2 license.
Please see [LICENSE.txt](LICENSE.txt).

The contributions in this repo copyright Matias Dahl 2022 are also released under the Apache 2 license.

The intent is that the original MLFlow codebase and modifications can be combined and released and distributed under the terms of the Apache 2 license.
