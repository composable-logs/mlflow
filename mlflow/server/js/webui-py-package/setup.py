import os

from typing import Any, List, Tuple
from pathlib import Path

from setuptools import setup, find_packages

# ---

PYTHON_PACKAGE_NAME = "composable-logs-webui"

# ASSETS_PATH is path to file assets to include into the Python package.
# The files can have a nested directory structure.
ASSETS_PATH = os.environ["ASSETS_PATH"]

# Determine package version
PYTHON_PACKAGE_VERSION: str = Path("PYTHON_PACKAGE_VERSION").read_text().splitlines()[0]

# PYTHON_PACKAGE_RELEASE_TARGET
PYTHON_PACKAGE_RELEASE_TARGET = os.environ["PYTHON_PACKAGE_RELEASE_TARGET"]

if PYTHON_PACKAGE_RELEASE_TARGET == "ci-build":
    # CI builds only test that we can build the package. For such builds, the
    # version is marked as "local" (with a +) so wheel can not be published to
    # PyPI (see, PEP 440).
    PYTHON_PACKAGE_VERSION += "+ci-build"

elif PYTHON_PACKAGE_RELEASE_TARGET == "main-release":
    # No changes needed for main release to PyPI
    pass

else:
    raise Exception(f"Unknown PYTHON_PACKAGE_RELEASE_TARGET={PYTHON_PACKAGE_RELEASE_TARGET}")

README_FILEPATH = os.environ["README_FILEPATH"]

# ---

print("setup.py: README_FILEPATH                 : ", README_FILEPATH)
print("setup.py: ASSETS_PATH                     : ", ASSETS_PATH)
print("setup.py: PYTHON_PACKAGE_RELEASE_TARGET   : ", PYTHON_PACKAGE_RELEASE_TARGET)
print("setup.py: PYTHON_PACKAGE_VERSION          : ", PYTHON_PACKAGE_VERSION)

# ---

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
    seem to support "include this directory tree". See,

    https://docs.python.org/3/distutils/setupscript.html#installing-additional-files
    """

    if not assets.is_dir():
        raise Exception(
            f"Please add files under {assets} directory before building {PYTHON_PACKAGE_NAME}!"
        )

    files = [f for f in assets.glob("**/*") if f.is_file()]

    # Abort if we try to add file system root etc
    if len(files) > 75:
        raise Exception("Too many files: 75 safeguard limit reached!")

    # Group data into dict with structure
    #
    #   "relative/path/to/files" (for output) -> [list to (input) file paths]
    #
    dir_to_list_of_files_dict = {}
    for f in files:
        # When the package is installed like:
        #
        #   pip install <package name> --target path/to/install/dir
        #
        # Then the package data files are written to the target directory, but so
        # are Python package-directories. By adding the asset-directory prefix
        # like below, package (1) data, (2) code, and (3) metadate are all written
        # in separate directories.
        dir_name: str = str(Path("assets") / f.relative_to(assets).parent)
        full_filename: str = str(f)

        if dir_name in dir_to_list_of_files_dict:
            dir_to_list_of_files_dict[dir_name].append(full_filename)
        else:
            dir_to_list_of_files_dict[dir_name] = [full_filename]

    return list(dir_to_list_of_files_dict.items())


setup(
    name=PYTHON_PACKAGE_NAME,
    author="Matias Dahl (based on a modified version of the MLFlow project)",
    description=(
        "This Python package contain compiled web assets for a fork "
        "of the MLFlow front end."
        "It is modified so that it can be deployed as a static website without a backend."
    ),
    long_description=Path(README_FILEPATH).read_text(),
    long_description_content_type="text/markdown",
    author_email="matias.dahl@iki.fi",
    license="Various, see the description",
    classifiers=[],
    url="https://composable-logs.github.io/pynb-dag-runner/",
    version=PYTHON_PACKAGE_VERSION,
    packages=find_packages(),
    data_files=_list_assets_files(assets=Path(ASSETS_PATH)),
)
