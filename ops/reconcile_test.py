import importlib.util
import json
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import patch

spec = importlib.util.spec_from_file_location('reconcile', Path(__file__).with_name('reconcile.py'))
r = importlib.util.module_from_spec(spec)
spec.loader.exec_module(r)


def exercise(tmp_path, prior, hard=False):
    state = tmp_path / 'state.json'
    state.write_text(json.dumps(prior))
    calls = []
    def run(args):
        calls.append(args)
        return SimpleNamespace(returncode=0, stdout='false|{}' if hard else 'true|{"soil-sampling-csv_default":{}}')
    with patch.object(r, 'ROOT', tmp_path), patch.object(r, 'STATE', state), patch.object(r, 'run', run), patch.object(r.time, 'time', return_value=1000), patch.object(r.urllib.request, 'urlopen', side_effect=TimeoutError):
        r.main()
    return [c for c in calls if 'compose' in c]


def test_busy_request_not_restarted(tmp_path):
    assert not exercise(tmp_path, {'unhealthy_since': 800})


def test_prolonged_failure_recovers(tmp_path):
    assert len(exercise(tmp_path, {'unhealthy_since': 700})) == 1


def test_missing_network_recovers_immediately(tmp_path):
    assert len(exercise(tmp_path, {}, hard=True)) == 1


def test_cooldown_and_maintenance(tmp_path):
    assert not exercise(tmp_path, {'repairs': [800, 850, 900]}, hard=True)
    (tmp_path / '.maintenance').touch()
    assert not exercise(tmp_path, {}, hard=True)


def test_timeout_consumes_attempt(tmp_path):
    state = tmp_path / 'state.json'
    def run(args):
        if 'compose' in args:
            raise r.subprocess.TimeoutExpired(args, 60)
        return SimpleNamespace(returncode=0, stdout='false|{}')
    with patch.object(r, 'ROOT', tmp_path), patch.object(r, 'STATE', state), patch.object(r, 'run', run), patch.object(r.time, 'time', return_value=1000):
        r.main()
    assert json.loads(state.read_text())['repairs'] == [1000]
