"""
evaluate_model.py
=================
Evaluation harness for validating facial-expression recognition models on standardized datasets.

Author: Milu (Member 3 – AI Developer)
Module: backend.ai.evaluate_model

Engineering Policy:
Accuracy metrics MUST NOT be claimed without empirical evaluation on a verified test set.
This module provides a reproducible evaluation pipeline once test datasets (e.g. FER-2013 test split)
and verified model weights are supplied.
"""

import argparse
import os
from pathlib import Path
import sys
from typing import Any, Dict, List, Optional, Tuple, Union
import cv2
import numpy as np
import torch

# Ensure repository root is in sys.path when executed directly
_REPO_ROOT = Path(__file__).resolve().parent.parent.parent
if str(_REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(_REPO_ROOT))

from backend.ai.emotion_model import (
    AFFECTNET_TO_VIBESHIFT_INDICES,
    EXPRESSION_LABELS,
    NUM_CLASSES,
    EmotiEffAdapter,
    EmotionModelInterface,
)
from backend.ai.preprocess import (
    preprocess_face_for_emotieff,
    preprocess_face_for_mobilenet,
)


def evaluate_dataset_directory(
    dataset_dir: str,
    model: Union[EmotionModelInterface, EmotiEffAdapter],
    batch_size: int = 32,
) -> Dict[str, Any]:
    """
    Evaluates model performance on a structured directory of expression images using batched inference.

    Expected directory format:
      dataset_dir/
        ├── angry/
        ├── disgust/
        ├── fear/
        ├── happy/
        ├── sad/
        ├── surprise/
        └── neutral/

    Calculates:
      - Overall accuracy
      - Per-class precision, recall, and F1-score
      - Macro-average precision, recall, and F1-score
      - Full confusion matrix

    Args:
        dataset_dir: Path to directory containing class subfolders.
        model: EmotionModelInterface or EmotiEffAdapter instance with verified loaded weights.
        batch_size: Batch size for GPU/CPU parallel inference (default 32).

    Returns:
        Dictionary of computed empirical evaluation metrics.
    """
    if not model.is_weights_loaded:
        raise RuntimeError(
            "Cannot run evaluation: Model weights are not loaded. "
            "Please provide a verified PyTorch weights file."
        )

    if not os.path.isdir(dataset_dir):
        raise FileNotFoundError(f"Dataset directory not found: '{dataset_dir}'")

    batch_size = max(1, int(batch_size))
    confusion_matrix = np.zeros((NUM_CLASSES, NUM_CLASSES), dtype=np.int64)
    total_samples = 0
    is_emotieff = isinstance(model, EmotiEffAdapter)

    print(f"Beginning evaluation on: {dataset_dir}")
    print(f"Model Type: {type(model).__name__}")
    print(f"Evaluating classes: {list(EXPRESSION_LABELS)} (Batch Size: {batch_size})")

    # Queue of samples for batch execution: list of (torch.Tensor, true_class_index)
    batch_tensors: List[torch.Tensor] = []
    batch_targets: List[int] = []

    def _flush_batch():
        nonlocal total_samples
        if not batch_tensors:
            return

        batch_input = torch.cat(batch_tensors, dim=0).to(model.device)
        with torch.no_grad():
            logits = model.model(batch_input)
            raw_preds = torch.argmax(logits, dim=1).cpu().numpy()

        for true_idx, raw_pred_idx in zip(batch_targets, raw_preds):
            if is_emotieff:
                # Re-map AffectNet logit index to VibeShift canonical label index
                label_str = AFFECTNET_TO_VIBESHIFT_INDICES[int(raw_pred_idx)]
                pred_idx = EXPRESSION_LABELS.index(label_str)
            else:
                pred_idx = int(raw_pred_idx)

            confusion_matrix[true_idx, pred_idx] += 1
            total_samples += 1

        batch_tensors.clear()
        batch_targets.clear()

    for true_idx, true_label in enumerate(EXPRESSION_LABELS):
        class_folder = os.path.join(dataset_dir, true_label)
        if not os.path.isdir(class_folder):
            print(f"[Warning] Subfolder for class '{true_label}' not found in dataset. Skipping.")
            continue

        filenames = [
            f for f in os.listdir(class_folder)
            if f.lower().endswith((".png", ".jpg", ".jpeg", ".bmp"))
        ]

        for fname in filenames:
            img_path = os.path.join(class_folder, fname)
            img = cv2.imread(img_path, cv2.IMREAD_COLOR)
            if img is None:
                continue

            if is_emotieff:
                tensor = preprocess_face_for_emotieff(img)
            else:
                tensor = preprocess_face_for_mobilenet(img)

            if tensor is None:
                continue

            batch_tensors.append(tensor)
            batch_targets.append(true_idx)

            if len(batch_tensors) >= batch_size:
                _flush_batch()

    # Flush any remaining items in final batch
    _flush_batch()

    if total_samples == 0:
        return {
            "status": "no_images_evaluated",
            "total_samples": 0,
            "overall_accuracy": 0.0,
            "macro_precision": 0.0,
            "macro_recall": 0.0,
            "macro_f1": 0.0,
            "per_class_metrics": {},
            "confusion_matrix": confusion_matrix.tolist(),
            "expression_labels": list(EXPRESSION_LABELS),
        }

    # 1. Overall Accuracy
    correct_samples = int(np.trace(confusion_matrix))
    overall_accuracy = correct_samples / total_samples

    # 2. Per-class metrics
    per_class_metrics: Dict[str, Dict[str, float]] = {}
    precisions: List[float] = []
    recalls: List[float] = []
    f1_scores: List[float] = []

    for i, label in enumerate(EXPRESSION_LABELS):
        tp = float(confusion_matrix[i, i])
        fp = float(np.sum(confusion_matrix[:, i]) - tp)
        fn = float(np.sum(confusion_matrix[i, :]) - tp)
        support = int(np.sum(confusion_matrix[i, :]))

        precision = tp / (tp + fp) if (tp + fp) > 0 else 0.0
        recall = tp / (tp + fn) if (tp + fn) > 0 else 0.0
        f1 = (2.0 * precision * recall) / (precision + recall) if (precision + recall) > 0 else 0.0

        precisions.append(precision)
        recalls.append(recall)
        f1_scores.append(f1)

        per_class_metrics[label] = {
            "precision": round(precision, 4),
            "recall": round(recall, 4),
            "f1_score": round(f1, 4),
            "support": support,
        }

    # 3. Macro averages
    macro_precision = float(np.mean(precisions))
    macro_recall = float(np.mean(recalls))
    macro_f1 = float(np.mean(f1_scores))

    return {
        "status": "evaluation_complete",
        "total_samples": total_samples,
        "correct_samples": correct_samples,
        "overall_accuracy": round(overall_accuracy, 4),
        "macro_precision": round(macro_precision, 4),
        "macro_recall": round(macro_recall, 4),
        "macro_f1": round(macro_f1, 4),
        "per_class_metrics": per_class_metrics,
        "confusion_matrix": confusion_matrix.tolist(),
        "expression_labels": list(EXPRESSION_LABELS),
    }


def main():
    parser = argparse.ArgumentParser(
        description="Evaluate VibeShift facial-expression recognition model on a test set."
    )
    parser.add_argument(
        "--dataset-dir",
        type=str,
        required=True,
        help="Path to folder containing test class subdirectories (angry, disgust, etc.).",
    )
    parser.add_argument(
        "--weights-path",
        type=str,
        required=True,
        help="Path to verified PyTorch model weights (.pt or .pth).",
    )
    parser.add_argument(
        "--batch-size",
        type=int,
        default=32,
        help="Batch size for parallel inference (default: 32).",
    )
    parser.add_argument(
        "--device",
        type=str,
        default="cpu",
        help="Device to run evaluation on ('cpu' or 'cuda'). Default: 'cpu'.",
    )

    args = parser.parse_args()

    if not os.path.isfile(args.weights_path):
        print(f"[Error] Weights file not found: {args.weights_path}")
        sys.exit(1)

    if "enet_b2" in os.path.basename(args.weights_path).lower():
        model = EmotiEffAdapter(weights_path=args.weights_path, device=args.device)
    else:
        model = EmotionModelInterface(weights_path=args.weights_path, device=args.device)

    if not model.is_weights_loaded:
        print("[Error] Failed to load model weights. Ensure weights match architecture.")
        sys.exit(1)

    try:
        results = evaluate_dataset_directory(
            args.dataset_dir,
            model,
            batch_size=args.batch_size,
        )

        print("\n================ Classification Report ================")
        print(f"{'Class':<12} {'Precision':<10} {'Recall':<10} {'F1-Score':<10} {'Support':<8}")
        print("-" * 52)
        for label, m in results["per_class_metrics"].items():
            print(
                f"{label:<12} "
                f"{m['precision'] * 100:>8.2f}% "
                f"{m['recall'] * 100:>8.2f}% "
                f"{m['f1_score'] * 100:>8.2f}% "
                f"{m['support']:>8}"
            )
        print("-" * 52)
        print(f"Overall Accuracy:  {results['overall_accuracy'] * 100:.2f}%")
        print(f"Macro Precision:   {results['macro_precision'] * 100:.2f}%")
        print(f"Macro Recall:      {results['macro_recall'] * 100:.2f}%")
        print(f"Macro F1-Score:    {results['macro_f1'] * 100:.2f}%")
        print(f"Total Samples:     {results['total_samples']}")
        print("=======================================================\n")
    except Exception as e:
        print(f"[Evaluation Error]: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
