#!/usr/bin/env python3
"""Reconcile this test API only; never build images or restart the Docker daemon."""
import json
import subprocess
import time
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
STATE = ROOT / '.recovery-state.json'
CONTAINER = 'soil-sampling-csv-app-1'
NETWORK = 'soil-sampling-csv_default'


def run(args):
    return subprocess.run(args, cwd=ROOT, capture_output=True, text=True, timeout=60)


def save(state):
    temporary = STATE.with_suffix(".tmp")
    temporary.write_text(json.dumps(state))
    temporary.replace(STATE)


def main():
    # An intentionally stopped deployment must remain stopped while maintenance is enabled.
    if (ROOT / '.maintenance').exists():
        return
    now = time.time()
    try:
        state = json.loads(STATE.read_text())
    except (FileNotFoundError, ValueError):
        state = {}
    # Docker unavailable is a host issue; do not attempt host-wide remediation.
    if run(['docker', 'info', '--format', '{{.ServerVersion}}']).returncode:
        print('Docker unavailable; leaving host services alone.', flush=True)
        return
    result = run(['docker', 'inspect', '--format',
                  '{{json .State.Running}}|{{json .NetworkSettings.Networks}}', CONTAINER])
    hard_failure = result.returncode != 0
    if not hard_failure:
        running, networks = result.stdout.strip().split('|', 1)
        hard_failure = not json.loads(running) or NETWORK not in json.loads(networks)
    healthy = False
    if not hard_failure:
        try:
            with urllib.request.urlopen('http://127.0.0.1:5000/', timeout=5) as response:
                healthy = response.status == 200 and json.load(response) == {"message": "Hello World!"}
        except (OSError, TimeoutError, ValueError):
            pass
    if healthy:
        state.pop('unhealthy_since', None)
    else:
        since = state.setdefault('unhealthy_since', now)
        # One synchronous worker can serve a legitimate request for 180 seconds.
        # Require >240 seconds of consecutive liveness failures before interrupting it.
        if hard_failure or now - since > 240:
            repairs = [t for t in state.get('repairs', []) if now - t < 900]
            if len(repairs) < 3:
                print('Repairing app: missing process/network.' if hard_failure else
                      'Repairing app: liveness failed continuously for over 240 seconds.', flush=True)
                repairs.append(now)
                state['repairs'] = repairs
                state['unhealthy_since'] = now
                save(state)  # Persist before execution: a timeout still consumes an attempt.
                try:
                    repaired = run(['docker', 'compose', '-p', 'soil-sampling-csv', 'up',
                                '-d', '--no-deps', '--no-build', '--force-recreate', 'app'])
                except subprocess.TimeoutExpired:
                    print('App reconcile timed out; attempt counted for cooldown.', flush=True)
                    return
                print('App reconcile command succeeded.' if repaired.returncode == 0 else
                      'App reconcile failed; inspect app state. Command output withheld.', flush=True)
                state['unhealthy_since'] = now
            else:
                print('Recovery cooldown: three attempts in 15 minutes; inspect deployment.', flush=True)
    save(state)


if __name__ == '__main__':
    main()
