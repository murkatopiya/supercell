/** Observational storage only. No evaluator, numerical algorithm, callback sink or I/O. */
declare const brand: unique symbol;
export type CaptureContext = Readonly<{ [brand]: true }>;
export type CaptureData = null | undefined | boolean | string | number | readonly CaptureData[] |
  { readonly [key: string]: CaptureData };
export type CaptureEvent = Readonly<{ sequence: number; call: number; parent: number | null;
  site: string; value: CaptureData }>;
export type CaptureSnapshot = Readonly<{ schema: "p2-failure-capture/v1";
  state: "COMPLETE_GENERATED_PREFIX" | "INCOMPLETE"; reasons: readonly string[];
  events: readonly CaptureEvent[] }>;
type State = { events: CaptureEvent[]; nextCall: number; closed: boolean; failed: boolean;
  remaining: number | undefined; immutable: WeakMap<object, CaptureData> };
type Scope = { state: State; call: number; parent: number | null };
const scopes = new WeakMap<CaptureContext, Scope>();
const owners = new WeakMap<object, CaptureContext>();
const unavailable = Object.freeze({ unavailable: "NON_DATA_VALUE" });
const incomplete: CaptureSnapshot = Object.freeze({ schema: "p2-failure-capture/v1",
  state: "INCOMPLETE", reasons: Object.freeze(["CAPTURE_UNAVAILABLE"]), events: Object.freeze([]) });

// Descriptor traversal never invokes an accessor or a function. Inputs must obey
// the reviewed plain-data/pure-provider contract; arbitrary proxies are excluded.
function copy(value: unknown, immutable: WeakMap<object, CaptureData>, active = new Set<object>()): CaptureData {
  if (value === null || value === undefined || typeof value === "number" ||
    typeof value === "string" || typeof value === "boolean") return value;
  if (typeof value === "bigint") return Object.freeze({ integer: value.toString() });
  if (typeof value !== "object") return unavailable;
  if (immutable.has(value)) return immutable.get(value)!;
  if (active.has(value)) return Object.freeze({ unavailable: "CYCLE" });
  const array = Array.isArray(value);
  if (!array && Object.getPrototypeOf(value) !== Object.prototype && Object.getPrototypeOf(value) !== null)
    return unavailable;
  active.add(value);
  let stable = Object.isFrozen(value);
  const result: Record<string, CaptureData> | CaptureData[] = array ? new Array(value.length) : Object.create(null);
  for (const key of Object.keys(value).sort()) {
    const descriptor = Object.getOwnPropertyDescriptor(value, key)!;
    const child = "value" in descriptor ? copy(descriptor.value, immutable, active) : unavailable;
    if ("value" in descriptor && descriptor.value !== null && typeof descriptor.value === "object" && !immutable.has(descriptor.value)) stable = false;
    Object.defineProperty(result, key, { value: child,
      enumerable: true, writable: false, configurable: false });
  }
  active.delete(value);
  const snapshot = Object.freeze(result);
  if (stable) immutable.set(value, snapshot);
  return snapshot;
}

export function createCapture(): CaptureContext | undefined {
  try {
    const token = Object.freeze({}) as CaptureContext;
    scopes.set(token, { state: { events: [], nextCall: 1, closed: false, failed: false, remaining: undefined, immutable: new WeakMap() },
      call: 0, parent: null });
    return token;
  } catch { return undefined; }
}

export function bindCapture(owner: object, context: CaptureContext | undefined): void {
  let scope: Scope | undefined;
  try { if (context) { scope = scopes.get(context); owners.set(owner, context); } }
  catch { if (scope) scope.state.failed = true; }
}
export function boundCapture(owner: object): CaptureContext | undefined {
  try { return owners.get(owner); } catch { return undefined; }
}

/** Identity on the scientific value, even when snapshotting or journal append fails. */
export function captureValue<T>(context: CaptureContext | undefined, site: string, value: T): T {
  let scope: Scope | undefined;
  try {
    if (!context || !(scope = scopes.get(context)) || scope.state.closed || scope.state.failed) return value;
    const state = scope.state;
    if (state.remaining !== undefined && state.remaining-- <= 0) throw new Error("Injected recorder fault");
    const snapshot = copy(value, state.immutable);
    state.events.push(Object.freeze({ sequence: state.events.length, call: scope.call, parent: scope.parent, site, value: snapshot }));
  } catch { if (scope) scope.state.failed = true; }
  return value;
}

export function enterCapture(context: CaptureContext | undefined, site: string): CaptureContext | undefined {
  let scope: Scope | undefined;
  try {
    if (!context || !(scope = scopes.get(context)) || scope.state.closed || scope.state.failed) return undefined;
    const token = Object.freeze({}) as CaptureContext;
    scopes.set(token, { state: scope.state, call: scope.state.nextCall++, parent: scope.call });
    captureValue(token, site + "/enter", undefined);
    return token;
  } catch { if (scope) scope.state.failed = true; return undefined; }
}

/** Deterministic test fault, not a caller callback. Affects only recorder-owned state. */
export function injectCaptureFault(context: CaptureContext | undefined, afterEvents: number): void {
  try { const scope = context && scopes.get(context); if (scope && !scope.state.closed) scope.state.remaining = afterEvents; }
  catch { /* Never crosses the scientific boundary. */ }
}

export function closeCapture(context: CaptureContext | undefined): CaptureSnapshot {
  try {
    const scope = context && scopes.get(context);
    if (!scope) return incomplete;
    scope.state.closed = true;
    return Object.freeze({ schema: "p2-failure-capture/v1", state: scope.state.failed ? "INCOMPLETE" : "COMPLETE_GENERATED_PREFIX",
      reasons: Object.freeze(scope.state.failed ? ["RECORDER_FAILURE"] : []), events: Object.freeze([...scope.state.events]) });
  } catch { return incomplete; }
}
