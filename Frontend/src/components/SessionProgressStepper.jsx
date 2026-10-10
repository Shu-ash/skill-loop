// src/components/SessionProgressStepper.jsx
import React from 'react';

// SessionProgressStepper: 4-step progress tracker for active session lifecycle
export default function SessionProgressStepper({ currentStep = 2 }) {
  const steps = [
    { num: 1, label: 'Request Accepted' },
    { num: 2, label: 'Time Scheduled' },
    { num: 3, label: 'Call in Progress' },
    { num: 4, label: 'Complete & Review' },
  ];

  return (
    <div className="session-progress-stepper">
      {steps.map((step) => {
        const isCompleted = step.num < currentStep;
        const isCurrent = step.num === currentStep;

        return (
          <div
            key={step.num}
            className={`stepper-item ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}
          >
            <div className="stepper-circle">
              {isCompleted ? '✓' : step.num}
            </div>
            <span className="stepper-label">{step.label}</span>
          </div>
        );
      })}
    </div>
  );
}
