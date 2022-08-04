from typing import List
from pathlib import Path

from setuptools import setup, find_packages

PACKAGE_NAME = "pynb_dag_runner_webui"
PACKAGE_VERSION = "0.0.0"


def _list_assets_files() -> List[str]:
    """
    Return: list of data file assets to include in package.

    File names represented as strings and paths are relative to
    "assets"-directory.
    """

    if not (Path(__file__).parent / "assets").is_dir():
        raise Exception(
            f"Please add files under 'assets' directory before building "
            "{PACKAGE_NAME}!"
        )

    # Without str(..) we return a list of PosixPath:s which setup()
    # function does not seem to support.
    return [str(f) for f in Path("assets").glob("**/*") if f.is_file()]


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
    license="Various, see description",
    classifiers=[],
    url="https://pynb-dag-runner.github.io/pynb-dag-runner/",
    version=PACKAGE_VERSION,
    packages=find_packages(),
    data_files=[('assets', _list_assets_files())],
)
