.PHONY: debug
debug:
	FLASK_APP=soil_sampling.app flask run --debug --host 0.0.0.0

.PHONY: serve
serve:
	gunicorn -b 0.0.0.0:5000 soil_sampling.app:app --timeout 90
