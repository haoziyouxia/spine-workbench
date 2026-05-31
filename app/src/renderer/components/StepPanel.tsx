import React from 'react';
import { Step, StepId } from '../hooks/useStep';

interface StepPanelProps {
  steps: Step[];
  currentStep: StepId;
  onStepClick: (stepId: StepId) => void;
}

const StepPanel: React.FC<StepPanelProps> = ({ steps, currentStep, onStepClick }) => {
  const getStepStatus = (step: Step, index: number) => {
    const currentIndex = steps.findIndex(s => s.id === currentStep);
    if (step.id === currentStep) return 'active';
    if (index < currentIndex) return 'completed';
    return 'pending';
  };

  return (
    <div className="step-panel">
      <h3>流程步骤</h3>
      <div className="step-list">
        {steps.map((step, index) => {
          const status = getStepStatus(step, index);
          return (
            <div
              key={step.id}
              className={`step-item ${status}`}
              onClick={() => onStepClick(step.id)}
            >
              <div className="step-number">
                {status === 'completed' ? (
                  <span className="check-icon">✓</span>
                ) : (
                  index + 1
                )}
              </div>
              <div className="step-content">
                <div className="step-name">{step.name}</div>
                <div className="step-desc">{step.description}</div>
              </div>
              <div className="step-indicator">
                {index < steps.length - 1 && status !== 'pending' && (
                  <div className="step-line"></div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StepPanel;