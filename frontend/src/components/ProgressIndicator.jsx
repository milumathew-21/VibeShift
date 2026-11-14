import React from 'react';
import { Check } from 'lucide-react';

const STEPS = [
  { id: 1, label: '1. Select Mood' },
  { id: 2, label: '2. Confirm Mood' },
  { id: 3, label: '3. Vibe Direction' },
  { id: 4, label: '4. Preferences' },
  { id: 5, label: '5. Soundtrack' },
];

export default function ProgressIndicator({
  currentStep = 1,
  onStepSelect,
  maxUnlockedStep = 1,
}) {
  return (
    <nav
      className="progress-stepper"
      aria-label="Mood discovery and personalization steps"
    >
      {STEPS.map((step) => {
        const isActive = step.id === currentStep;
        const isCompleted = step.id < currentStep;
        const isClickable =
          Boolean(onStepSelect) && step.id <= Math.max(currentStep, maxUnlockedStep);

        return (
          <button
            key={step.id}
            type="button"
            onClick={() => isClickable && onStepSelect(step.id)}
            disabled={!isClickable}
            className={`progress-step-item ${isActive ? 'active' : ''} ${
              isCompleted ? 'completed' : ''
            }`}
            aria-current={isActive ? 'step' : undefined}
          >
            <span className="progress-step-circle" aria-hidden="true">
              {isCompleted ? <Check size={13} /> : step.id}
            </span>
            <span>{step.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

