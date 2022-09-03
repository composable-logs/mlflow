import os

from typing import Any, List, Tuple
from pathlib import Path

from setuptools import setup, find_packages

PACKAGE_NAME = "pynb_dag_runner_webui"
PACKAGE_VERSION = "0.0.0"
ASSETS_PATH = os.environ["ASSETS_PATH"]

OutputDirectoryPath = Any
InputFilepath = Any

def _list_assets_files(assets: Path) -> List[Tuple[OutputDirectoryPath, List[InputFilepath]]]:
    """
    Return list of (directory names, list of file names in directory)
    data file assets to include in package.

    - Directory names are listed relative to provided `assets`. These
      paths are used for writing files into the wheel directory structure.

    - Filenames are listed relative to current working directory
      (assumted to be location of setup.py). These are used to
      read files from local disk when creating the wheel file.

    - Thus, this makes it possible to reorganize the directory structure,
      but filenames can not be modified.

    The complexity of the below arises since Python setup does not
    seem to support "include this directory tree".  See,

    https://docs.python.org/3/distutils/setupscript.html#installing-additional-files
    """

    if not assets.is_dir():
        raise Exception(
            f"Please add files under {assets} directory before building "
            "{PACKAGE_NAME}!"
        )

    files = [f for f in assets.glob("**/*") if f.is_file()]

    # Abort if we try to add file system root etc
    if len(files) > 75:
        raise Exception("Too many files: 75 safeguard limit reached!")

    # Group data into dict with structure
    #
    #   "relative/path/to/files" -> ['list.txt', 'of.html', 'files.css']
    #
    dir_to_list_of_files_dict = {}
    for f in files:
        dir_name: str = str(f.relative_to(assets).parent)
        full_filename: str = str(f)

        if dir_name in dir_to_list_of_files_dict:
            dir_to_list_of_files_dict[dir_name].append(full_filename)
        else:
            dir_to_list_of_files_dict[dir_name] = [full_filename]

    return list(dir_to_list_of_files_dict.items())


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
    license="Various, see the description",
    classifiers=[],
    url="https://pynb-dag-runner.github.io/pynb-dag-runner/",
    version=PACKAGE_VERSION,
    packages=find_packages(),
    data_files=_list_assets_files(assets = Path(ASSETS_PATH)),
)
