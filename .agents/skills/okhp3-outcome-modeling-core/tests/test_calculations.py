import json
import subprocess
import sys
import unittest
from pathlib import Path


class CoreCalculationTest(unittest.TestCase):
    def test_fixture_metrics(self):
        root = Path(__file__).parents[1]
        result = subprocess.run([sys.executable, str(root / "scripts/calculate-outcome-model.py"), str(root / "examples/core-example.json")], check=True, capture_output=True, text=True)
        output = json.loads(result.stdout)
        self.assertAlmostEqual(output["weighted_mean"], 5 / 6)
        self.assertAlmostEqual(output["probability"], 0.6769958562, places=8)
        self.assertEqual(output["top_k_features"], ["form", "pressure"])
        self.assertEqual(output["options"][1]["net_expected_value"], 34.0)


if __name__ == "__main__":
    unittest.main()
