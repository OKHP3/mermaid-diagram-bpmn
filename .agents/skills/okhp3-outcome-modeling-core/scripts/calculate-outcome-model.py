#!/usr/bin/env python3
"""Deterministic, dependency-free calculations for the outcome-modeling core."""
import argparse
import json
import math
import sys


def sigmoid(value):
    if value >= 0:
        z = math.exp(-value)
        return 1.0 / (1.0 + z)
    z = math.exp(value)
    return z / (1.0 + z)


def load_input(path):
    if path:
        with open(path, encoding="utf-8") as handle:
            return json.load(handle)
    return json.load(sys.stdin)


def main():
    parser = argparse.ArgumentParser(description="Calculate transparent outcome-modeling metrics from local JSON.")
    parser.add_argument("input", nargs="?", help="JSON fixture path; reads stdin when omitted")
    args = parser.parse_args()
    data = load_input(args.input)
    result = {}

    events = data.get("events", [])
    if events:
        total_weight = sum(float(item["weight"]) for item in events)
        if total_weight <= 0:
            raise ValueError("event weights must sum to a positive value")
        result["weighted_mean"] = sum(float(item["value"]) * float(item["weight"]) for item in events) / total_weight

    logistic = data.get("logistic")
    if logistic:
        score = float(logistic.get("intercept", 0.0))
        for name, coefficient in logistic.get("coefficients", {}).items():
            score += float(coefficient) * float(logistic.get("features", {}).get(name, 0.0))
        result["logit"] = score
        result["probability"] = sigmoid(score)

    predictions = data.get("predictions", [])
    if predictions:
        brier = []
        losses = []
        for item in predictions:
            probability = min(max(float(item["probability"]), 1e-15), 1 - 1e-15)
            outcome = float(item["outcome"])
            brier.append((probability - outcome) ** 2)
            losses.append(-(outcome * math.log(probability) + (1 - outcome) * math.log(1 - probability)))
        result["brier_score"] = sum(brier) / len(brier)
        result["log_loss"] = sum(losses) / len(losses)

    importance = data.get("feature_importance", [])
    if importance:
        ordered = sorted(importance, key=lambda item: float(item["importance"]), reverse=True)
        total = sum(float(item["importance"]) for item in ordered)
        k = int(data.get("top_k", len(ordered)))
        result["top_k_importance_share"] = sum(float(item["importance"]) for item in ordered[:k]) / total if total else 0.0
        result["top_k_features"] = [item["name"] for item in ordered[:k]]

    options = data.get("options", [])
    if options:
        result["options"] = []
        for item in options:
            expected = float(item["probability"]) * float(item["success_value"]) + (1 - float(item["probability"])) * float(item.get("failure_value", 0.0))
            result["options"].append({"name": item["name"], "net_expected_value": expected - float(item.get("cost", 0.0))})

    print(json.dumps(result, indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
