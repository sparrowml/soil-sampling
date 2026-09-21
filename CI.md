# Continuous integration

The `Tests / offline-tests` GitHub Actions job runs on a disposable Linux x64
VM on moviebox, selected by `[self-hosted, Linux, X64, moviebox, soil-sampling]`.
It checks pull requests from this repository and pushes to main. Fork PRs do not
run on this private fleet; review and copy accepted contributions to a local
branch before running CI. The workflow has read-only repository permissions.

Each job gets a fresh VM with its own Docker daemon, 4 vCPUs and 16 GiB RAM.
There are no host mounts or host Docker access. Private/Tailscale networks are
blocked, so tests cannot reach the live application or other moviebox services.
The first step checks that the previous job's marker and host credential are
absent and probes the blocked host SSH/application ports. The VM and runner
registration are discarded after each job; one job runs at a time for this repo.

CI installs Python 3.10 and `requirements-main.txt`, then runs:

```sh
python -m pytest -q soil_sampling/csv_upload_test.py
python -m pytest -q soil_sampling/app_test.py -k 'uniform or order_points'
```

These cover CSV uploads, validation, legacy shapefile compatibility,
and offline uniform sampling/point ordering. Other existing endpoint tests call
USDA services and are deliberately excluded from the offline suite.
They can be run separately when those services are available. CI does not deploy.

Operations use `moviebox-ci@soil-sampling.service`. Verify actual online runner
registration with `gh api repos/sparrowml/soil-sampling/actions/runners`; systemd
running alone does not prove readiness. Stop this service only when idle to pause
CI. Do not modify the shared base image while any fleet VM is running. The fleet
runbook in the shared agent workspace (`shared/ci/fleet/README.md`) documents
credential renewal, isolation, capacity, recovery and image replacement.
