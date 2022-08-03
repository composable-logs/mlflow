from setuptools import setup, find_packages

PACKAGE_NAME = "pynb_dag_runner_static_ui"

setup(
    name=PACKAGE_NAME,
    author="Matias Dahl (based on modified version of the MLFlow project)",
    author_email="matias.dahl@iki.fi",
    license="TODO",
    classifiers=[],
    url="https://pynb-dag-runner.github.io/pynb-dag-runner/",
    version="0.0.1",
    packages=find_packages(),
    # file paths relative to package root
    package_data={PACKAGE_NAME: ['data-file.txt']},
)
