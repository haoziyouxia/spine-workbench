import { useState } from 'react';

export type StepId = 'import' | 'parts' | 'correct' | 'bones' | 'export';

export interface Step {
  id: StepId;
  name: string;
  description: string;
}

export const steps: Step[] = [
  { id: 'import', name: '导入', description: '导入角色图片' },
  { id: 'parts', name: '拆件建议', description: '自动识别部件区域' },
  { id: 'correct', name: '人工修正', description: '调整拆件结果' },
  { id: 'bones', name: '骨点调整', description: '编辑骨骼节点' },
  { id: 'export', name: '导出', description: '生成 Spine 就绪包' }
];

export const useStep = () => {
  const [currentStep, setCurrentStep] = useState<StepId>('import');

  const goToStep = (stepId: StepId) => {
    setCurrentStep(stepId);
  };

  const nextStep = () => {
    const currentIndex = steps.findIndex(s => s.id === currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1].id);
    }
  };

  const prevStep = () => {
    const currentIndex = steps.findIndex(s => s.id === currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1].id);
    }
  };

  const getCurrentStepIndex = () => {
    return steps.findIndex(s => s.id === currentStep);
  };

  const getCurrentStepInfo = () => {
    return steps.find(s => s.id === currentStep) || steps[0];
  };

  return {
    currentStep,
    steps,
    goToStep,
    setCurrentStep,
    nextStep,
    prevStep,
    getCurrentStepIndex,
    getCurrentStepInfo
  };
};