import { isStepKey } from "./plan";

export const SCREENS = ["inicio", "emergencia", "selector", "detalles", "plan", "paso", "denuncia", "borrar", "completo"] as const;
export type Screen = (typeof SCREENS)[number];

export interface Route {
  screen: Screen;
  stepKey?: string;
}

/** Screens that only make sense once the person chose what was taken. */
const NEEDS_SELECTION: Screen[] = ["detalles", "plan", "paso", "denuncia", "completo"];

export const START: Route = { screen: "inicio" };

function isScreen(value: string): value is Screen {
  return (SCREENS as readonly string[]).includes(value);
}

/** Parses `#/plan` or `#/paso/phone` or `#/paso/card:nu`. Anything else goes to the start screen. */
export function parseHash(hash: string): Route {
  const [screen, stepKey] = hash.replace(/^#\/?/, "").split("/");
  if (!screen || !isScreen(screen)) return START;
  if (screen === "paso") return isStepKey(stepKey) ? { screen, stepKey } : { screen: "plan" };
  return { screen };
}

export function toHash(route: Route): string {
  if (route.screen === "inicio") return "#/";
  if (route.screen === "paso" && route.stepKey) return `#/paso/${route.stepKey}`;
  return `#/${route.screen}`;
}

/** Sends the person somewhere valid when a link or the back button points to a screen they cannot see yet. */
export function resolveRoute(route: Route, hasSelection: boolean, stepKeys: readonly string[]): Route {
  if (NEEDS_SELECTION.includes(route.screen) && !hasSelection) return { screen: "selector" };
  if (route.screen === "paso" && (!route.stepKey || !stepKeys.includes(route.stepKey))) return { screen: "plan" };
  return route;
}

export function sameRoute(a: Route, b: Route): boolean {
  return a.screen === b.screen && a.stepKey === b.stepKey;
}
