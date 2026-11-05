import { isExpired, type Content, type Entity, type Guide, type Urgency } from "./content";

export const ASSET_IDS = ["phone", "card", "id-card", "email", "documents"] as const;
export type AssetId = (typeof ASSET_IDS)[number];

export const STEP_IDS = ["phone", "card", "passwords", "report", "id-card", "documents", "general"] as const;
export type StepId = (typeof STEP_IDS)[number];

/** Value used in details when the person does not know the answer. */
export const UNKNOWN = "unknown";

export interface Selection {
  assets: AssetId[];
  /** The person chose "No lo sé": they do not know what was taken. */
  unknown: boolean;
}

export interface Details {
  operatorId?: string;
  /** One plan step per bank, in the order they were chosen. */
  bankIds?: string[];
}

export interface PlanStep {
  id: StepId;
  /** Unique within the plan: the step id, plus the bank for card steps (`card:nu`). */
  key: string;
  title: string;
  urgency: Urgency;
  instructions: string[];
  whatToSay?: string;
  notice?: string;
  /** Suggested but not required, for example the report when only the ID card was taken. */
  optional: boolean;
  entity?: Entity;
  /** True when the guide or its entity is past its `vence` date. */
  expired: boolean;
  sampleReference?: string;
  source: string;
  verifiedOn: string;
  expiresOn: string;
}

const URGENCY_RANK: Record<Urgency, number> = { ahora: 0, hoy: 1, "esta-semana": 2 };

const STEP_ORDER: Record<StepId, number> = Object.fromEntries(
  STEP_IDS.map((id, index) => [id, index]),
) as Record<StepId, number>;

/** Assets that make the police report required rather than suggested. */
const REPORT_REQUIRED_FOR: AssetId[] = ["phone", "card"];

export function isAssetId(value: unknown): value is AssetId {
  return typeof value === "string" && (ASSET_IDS as readonly string[]).includes(value);
}

export function isStepId(value: unknown): value is StepId {
  return typeof value === "string" && (STEP_IDS as readonly string[]).includes(value);
}

export function isStepKey(value: unknown): value is string {
  return typeof value === "string" && isStepId(value.split(":")[0]);
}

export function cardKey(bankId: string | undefined): string {
  return bankId && bankId !== UNKNOWN ? `card:${bankId}` : "card";
}

export function needsOperator(selection: Selection): boolean {
  return !selection.unknown && selection.assets.includes("phone");
}

export function needsBank(selection: Selection): boolean {
  return !selection.unknown && selection.assets.includes("card");
}

/** Whether the details screen has anything to ask for this selection. */
export function needsDetails(selection: Selection): boolean {
  return needsOperator(selection) || needsBank(selection);
}

export function stepIdsFor(selection: Selection): StepId[] {
  const { assets } = selection;
  if (selection.unknown || assets.length === 0) return ["general"];

  const ids: StepId[] = [];
  if (assets.includes("phone")) ids.push("phone");
  if (assets.includes("card")) ids.push("card");
  if (assets.includes("phone") || assets.includes("email")) ids.push("passwords");
  ids.push("report");
  if (assets.includes("id-card")) ids.push("id-card");
  if (assets.includes("documents")) ids.push("documents");
  return ids;
}

function chosenEntityId(guide: Guide, details: Details, bankId: string | undefined): string | undefined {
  if (guide.entityKind === "operador") return details.operatorId;
  if (guide.entityKind === "banco") return bankId;
  return undefined;
}

function resolveEntity(guide: Guide, details: Details, bankId: string | undefined, entities: Entity[]): Entity | undefined {
  if (!guide.entityKind) return undefined;
  const ofKind = entities.filter((entity) => entity.kind === guide.entityKind);
  if (guide.entityKind === "operador" || guide.entityKind === "banco") {
    const id = chosenEntityId(guide, details, bankId);
    return ofKind.find((entity) => entity.id === id);
  }
  return ofKind[0];
}

function instructionsFor(guide: Guide, entity: Entity | undefined): string[] {
  const instructions = guide.whatToSay ? [] : [...guide.steps];
  const asksForEntity = guide.entityKind === "operador" || guide.entityKind === "banco";
  if (asksForEntity && !entity && guide.ifEntityUnknown) instructions.unshift(guide.ifEntityUnknown);
  if (guide.id === "phone" && guide.ifImeiUnknown) instructions.push(guide.ifImeiUnknown);
  return instructions;
}

function toStep(
  id: StepId,
  guide: Guide,
  selection: Selection,
  details: Details,
  bankId: string | undefined,
  content: Content,
  today: string,
): PlanStep {
  const entity = resolveEntity(guide, details, bankId, content.entities);
  const optional = id === "report" && !selection.assets.some((asset) => REPORT_REQUIRED_FOR.includes(asset));
  return {
    id,
    key: id === "card" ? cardKey(bankId) : id,
    title: id === "card" && entity ? `${guide.title} de ${entity.name}` : guide.title,
    urgency: guide.urgency,
    instructions: instructionsFor(guide, entity),
    whatToSay: guide.whatToSay,
    notice: guide.notice,
    optional,
    entity,
    expired: isExpired(guide, today) || (entity !== undefined && isExpired(entity, today)),
    sampleReference: guide.sampleReference,
    source: guide.source,
    verifiedOn: guide.verifiedOn,
    expiresOn: guide.expiresOn,
  };
}

/** Builds the plan for a selection, ordered by urgency. The phone always comes first. Sorting is stable, so banks keep their order. */
export function buildPlan(selection: Selection, details: Details, content: Content, today: string): PlanStep[] {
  const steps: PlanStep[] = [];
  for (const id of stepIdsFor(selection)) {
    const guide = content.guides.find((candidate) => candidate.id === id);
    if (!guide) continue;
    const bankIds = id === "card" && details.bankIds?.length ? details.bankIds : [undefined];
    for (const bankId of bankIds) steps.push(toStep(id, guide, selection, details, bankId, content, today));
  }
  const rank = (step: PlanStep) => (step.id === "phone" ? -1 : URGENCY_RANK[step.urgency]);
  return steps.sort((a, b) => rank(a) - rank(b) || STEP_ORDER[a.id] - STEP_ORDER[b.id]);
}

export function entitiesOfKind(content: Content, kind: Entity["kind"]): Entity[] {
  return content.entities.filter((entity) => entity.kind === kind);
}
