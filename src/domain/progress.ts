import type { PlanStep, StepId } from "./plan";

export function markDone(done: readonly StepId[], id: StepId): StepId[] {
  return done.includes(id) ? [...done] : [...done, id];
}

export function markPending(done: readonly StepId[], id: StepId): StepId[] {
  return done.filter((doneId) => doneId !== id);
}

export function countDone(steps: readonly PlanStep[], done: readonly StepId[]): number {
  return steps.filter((step) => done.includes(step.id)).length;
}

/** "N de M hechas". */
export function progressLabel(steps: readonly PlanStep[], done: readonly StepId[]): string {
  return `${countDone(steps, done)} de ${steps.length} hechas`;
}

/** The first step that is not done yet: the one the plan view keeps open. */
export function currentStep(steps: readonly PlanStep[], done: readonly StepId[]): PlanStep | undefined {
  return steps.find((step) => !done.includes(step.id));
}

/** A plan is complete when every required step is done. Optional steps stay as suggestions. */
export function isPlanComplete(steps: readonly PlanStep[], done: readonly StepId[]): boolean {
  return steps.length > 0 && steps.every((step) => step.optional || done.includes(step.id));
}
