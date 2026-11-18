# Test deployment operations

Moviebox directory: `~/deploy/soil-sampling-csv`; Compose project:
`soil-sampling-csv`. Public API: https://sspot.ngrok.dev. Keep PR #23 open.

## October 29 availability repair

Docker recorded app startup failure on October 23: binding
`100.113.66.30:5000` failed with `cannot assign requested address`.
Host boot logs show Docker starting at 21:31:14 UTC, before Tailscale became
ready at 21:32:20 UTC. The app remained exited (255), not OOM-killed, while
ngrok continued returning 502. The October 13 detached-network incident may be
related, but its trigger was not proven.

The app now publishes only `127.0.0.1:5000`, independent of Tailscale readiness;
ngrok uses `app:5000` on the existing Compose network. Direct Tailscale port 5000
is replaced by SSH forwarding:

```sh
ssh -L 5000:127.0.0.1:5000 jbencook@moviebox
# In another terminal:
curl --fail http://127.0.0.1:5000/
```

The deployment uses its existing image; `.env` holds the ngrok token with mode
0600 and is excluded from Git and image builds. Never print Compose's complete
resolved config, container environment, or `.env`.

## Scoped recovery service

Copy `ops/` and `docker-compose.yml` to the deployment directory. Install as the
existing `jbencook` user (user lingering must be enabled for boot operation):

```sh
mkdir -p ~/.config/systemd/user
cp ops/soil-sampling-reconcile.{service,timer} ~/.config/systemd/user/
systemctl --user daemon-reload
systemctl --user enable --now soil-sampling-reconcile.timer
```

This supervisor targets the fixed project `soil-sampling-csv` and host port 5000;
keep `PORT=5000` in this deployment. The timer checks every 30 seconds. Missing app process/network is repaired using
its existing image; failed HTTP health must persist for over 240 seconds before
repair, allowing the single worker's 180-second request timeout. At most three
repairs run in any 15-minute window, then cooldown applies. No image builds,
ngrok restarts, Docker daemon restarts or other stacks are touched. Recovery
state is local `.recovery-state.json`; logs are in the user service journal.
Docker-unavailable and prolonged recovery failures require operator attention;
this is recovery supervision, not an external outage notification service.

```sh
systemctl --user status soil-sampling-reconcile.timer
journalctl --user -u soil-sampling-reconcile.service --since today
```

Before deliberately stopping/changing the deployment, `touch .maintenance`.
Remove it with `rm .maintenance` after maintenance to resume recovery.
To disable recovery: `systemctl --user disable --now soil-sampling-reconcile.timer`.
Wait for any running reconcile service to finish before maintenance.
Rollback: disable the timer and restore the prior Compose file. Keep the loopback
binding unless deliberately accepting the documented Tailscale boot race; the
old secret-bearing environment backup is `.env.pre-reliability` (0600).

Validation includes real public multipart clustering, app process restart, and
network detach/recovery scoped to this app. Do not repeat destructive tests while
clients are actively using the API. Run unit checks with
`pytest -q ops/reconcile_test.py`.
