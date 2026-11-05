import type { PlanStep } from "./plan";

export function markDone(done: readonly string[], key: string): string[] {
  return done.includes(key) ? [...done] : [...done, key];
}

export function markPending(done: readonly string[], key: string): string[] {
  return done.filter((doneKey) => doneKey !== key);
}

export function countDone(steps: readonly PlanStep[], done: readonly string[]): number {
  return steps.filter((step) => done.includes(step.key)).length;
}

/** "N de M hechas". */
export function progressLabel(steps: readonly PlanStep[], done: readonly string[]): string {
  return `${countDone(steps, done)} de ${steps.length} hechas`;
}

/** The first step that is not done yet: the one the plan view keeps open. */
export function currentStep(steps: readonly PlanStep[], done: readonly string[]): PlanStep | undefined {
  return steps.find((step) => !done.includes(step.key));
}

/** A plan is complete when every required step is done. Optional steps stay as suggestions. */
export function isPlanComplete(steps: readonly PlanStep[], done: readonly string[]): boolean {
  return steps.length > 0 && steps.every((step) => step.optional || done.includes(step.key));
}
