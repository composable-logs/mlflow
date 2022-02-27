export const STATIC_EXPERIMENTS = {
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

export const STATIC_RUNS = [{
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
