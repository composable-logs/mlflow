from pathlib import Path

from setuptools import setup, find_packages

PACKAGE_NAME = "pynb_dag_runner_webui"
PACKAGE_VERSION = "0.0.0"

# -- test that assets.zip is in the same directory as setup.py
if not (Path(__file__).parent / "assets.zip").is_file():
    raise Exception(f"Please add website.zip before building {PACKAGE_NAME}!")

setup(
    name=PACKAGE_NAME,
    author="Matias Dahl (based on a modified version of the MLFlow project)",
    description=(
        "This Python package contain compiled Javascript code from "
        "various sources and with different licenses; "
        "For details, please see the linked documentation and source repo "
        "https://github.com/pynb-dag-runner/mlflow and "
        "https://github.com/pynb-dag-runner/mlflow/pull/2"
    ),
    author_email="matias.dahl@iki.fi",
    license="Various",
    classifiers=[],
    url="https://pynb-dag-runner.github.io/pynb-dag-runner/",
    version=PACKAGE_VERSION,
    packages=find_packages(),
    # file paths relative to setup.py location
    data_files=[('assets', ["assets.zip"])],
)
