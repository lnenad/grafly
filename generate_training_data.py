"""
Generate 2000 Grafly fine-tuning examples → grafly_training_data.jsonl
and push as a proper HuggingFace dataset to lnesiak/grafly.io-diagram.

Usage:
    python generate_training_data.py [--no-push]
"""

import json
import random
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from training.system_message import SYSTEM_MESSAGE
from training.helpers import make_example
from training.variations import vary_diagram
from training.flowcharts import SCENARIOS as FLOW_SCENARIOS   # 20 x 25 = 500
from training.aws import SCENARIOS as AWS_SCENARIOS            # 24 x 25 = 600
from training.gcp import SCENARIOS as GCP_SCENARIOS            # 16 x 25 = 400
from training.basic import SCENARIOS as BASIC_SCENARIOS        # 12 x 25 = 300
from training.complex import SCENARIOS as COMPLEX_SCENARIOS    #  8 x 25 = 200

OUTPUT_PATH = Path(__file__).parent / "grafly_training_data.jsonl"
HF_REPO = "lnesiak/grafly.io-diagram"


def build_examples(scenarios: list) -> list:
    """
    Expand scenario dicts into training examples.
    Each of the 25 prompts gets its own diagram variant (vary_diagram),
    so prompt i always maps to a slightly different diagram (different
    label vocabulary + color palette) rather than a fixed output.
    """
    examples = []
    for s in scenarios:
        base_diagram = s["diagram"]
        for i, prompt in enumerate(s["prompts"]):
            diagram = vary_diagram(base_diagram, i)
            examples.append(make_example(SYSTEM_MESSAGE, prompt, diagram))
    return examples


def write_jsonl(examples: list) -> None:
    OUTPUT_PATH.write_text(
        "\n".join(
            json.dumps(ex, ensure_ascii=False, separators=(",", ":"))
            for ex in examples
        ),
        encoding="utf-8",
    )
    print(f"Wrote {len(examples)} lines to {OUTPUT_PATH}")


_DATASET_CARD = """\
---
language:
- en
license: mit
task_categories:
- text-generation
tags:
- diagram
- json-generation
- grafly
- fine-tuning
- synthetic
configs:
- config_name: default
  data_files:
  - split: train
    path: grafly_training_data.jsonl
---

# Grafly Diagram Generation – Fine-tuning Dataset

2 000 synthetic instruction-following examples for fine-tuning a small LLM to
generate **Grafly** diagram JSON from natural language prompts.

## Format

Each line in `grafly_training_data.jsonl` is one JSON object:

```json
{
  "messages": [
    {"role": "system",    "content": "<schema rules>"},
    {"role": "user",      "content": "<natural language prompt>"},
    {"role": "assistant", "content": "<Grafly diagram JSON>"}
  ]
}
```

## Coverage

| Category | Scenarios | Examples |
|---|---|---|
| Flowcharts | 20 | 500 |
| AWS architectures | 24 | 600 |
| GCP architectures | 16 | 400 |
| Basic / mixed | 12 | 300 |
| Multi-cloud / complex | 8 | 200 |
| **Total** | **80** | **2 000** |

Each scenario has 25 prompt variants, each paired with a distinct diagram
variant (different label vocabulary + color palette) so the model learns the
format rather than memorising fixed prompt→output pairs.
"""


def push_to_hub(examples: list) -> None:
    import io
    from huggingface_hub import HfApi

    api = HfApi()

    # Upload the JSONL data file
    api.upload_file(
        path_or_fileobj=str(OUTPUT_PATH),
        path_in_repo="grafly_training_data.jsonl",
        repo_id=HF_REPO,
        repo_type="dataset",
        commit_message="Update: 2000 varied examples (label synonyms + color palettes)",
    )

    # Upload the dataset card so HF viewer knows how to load the JSONL
    api.upload_file(
        path_or_fileobj=io.BytesIO(_DATASET_CARD.encode()),
        path_in_repo="README.md",
        repo_id=HF_REPO,
        repo_type="dataset",
        commit_message="Add dataset card with YAML metadata",
    )

    print(f"Pushed to https://huggingface.co/datasets/{HF_REPO}")


def main():
    no_push = "--no-push" in sys.argv

    all_examples = []
    all_examples.extend(build_examples(FLOW_SCENARIOS))
    all_examples.extend(build_examples(AWS_SCENARIOS))
    all_examples.extend(build_examples(GCP_SCENARIOS))
    all_examples.extend(build_examples(BASIC_SCENARIOS))
    all_examples.extend(build_examples(COMPLEX_SCENARIOS))

    print(f"Generated {len(all_examples)} examples.")

    random.seed(42)
    random.shuffle(all_examples)

    write_jsonl(all_examples)

    if not no_push:
        push_to_hub(all_examples)


if __name__ == "__main__":
    main()
