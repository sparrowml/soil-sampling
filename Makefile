#* Variables
SHELL := /usr/bin/env bash
PYTHON := python
PYTHONPATH := `pwd`

#* Docker variables
IMAGE := soil-sampling
VERSION := latest

.PHONY: test
test:
	pytest --cov=soil_sampling soil_sampling/

.PHONY: debug
debug:
	FLASK_APP=soil_sampling.app flask run --debug --host 0.0.0.0

.PHONY: serve
serve:
	gunicorn -b 0.0.0.0:5000 soil_sampling.app:app --timeout 90 --threads 4	

#* Docker
# Example: make docker-build VERSION=latest
# Example: make docker-build IMAGE=some_name VERSION=0.1.0
.PHONY: docker-build
docker-build:
	@echo Building docker $(IMAGE):$(VERSION) ...
	docker build \
		-t $(IMAGE):$(VERSION) . \
		--no-cache

# Example: make docker-remove VERSION=latest
# Example: make docker-remove IMAGE=some_name VERSION=0.1.0
.PHONY: docker-remove
docker-remove:
	@echo Removing docker $(IMAGE):$(VERSION) ...
	docker rmi -f $(IMAGE):$(VERSION)

.PHONY: freeze
freeze:
	uv pip compile -q -o requirements.txt setup.cfg
	echo "-e ." >> requirements.txt
	uv pip compile -q --extra dev -o requirements-dev.txt setup.cfg
	echo "-e ." >> requirements-dev.txt
