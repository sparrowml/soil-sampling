"""Send the sample to USDA and save the actual response (no mocked services)."""
import json
from pathlib import Path
import urllib.request

HERE = Path(__file__).resolve().parent
ENDPOINT = "https://pdi-staging.scinet.usda.gov/clustering"

if __name__ == "__main__":
    payload = (HERE / "request.json").read_bytes()
    request = urllib.request.Request(ENDPOINT, data=payload, headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(request, timeout=180) as response:
        result = json.load(response)
        status = response.status
    (HERE / "response.json").write_text(json.dumps(result, indent=2, allow_nan=False) + "\n")
    assert status == 200
    assert result["points"] and result["regions"], result
    assert len(result["points"]) == len(result["point_descriptions"]) == len(result["point_enrichments"])
    assert len(result["regions"]) == len(result["region_descriptions"])
    print(f"HTTP {status}: {len(result['points'])} sample points, {len(result['regions'])} regions")
    print(f"Clusters: {sorted(set(result['region_descriptions']))}")
    print("Saved actual USDA output to response.json")
