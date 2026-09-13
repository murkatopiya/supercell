import { describe, expect, it, vi } from "vitest";
import { readFileSync, mkdtempSync, readdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { E1_SPEC, FROZEN_E1_STORM_ONLY } from "./observedCMatrixE1Spec.js";
import { PHASE_P_CASES, PHASE_P_INHERITED, PHASE_P_SPEC as S } from "./observedLagrangianPhasePSpec.js";
import { assertClock, buildSupportTopology, bytesHash, checkFirstStepOracle, checkPhasePSpecIntegrity,
  collectPhaseP, commonTime, compareEvents, compareExposure, comparePathResponse, comparePositions,
  compareSuccessiveRefinements, compareT1, digest, excludedByCrossing, integrateExposure, matchCommonSamples,
  numericCheck, orderedSum, prefixTime, primaryAfterStep, QualificationArtifacts, segmentAt, evaluateSeed,
  selectPhasePStage, selectQualifiedCandidate, serializeCanonicalRecord, staticPreflight, supportAt,
  inspectAcceptedSegment, type AdmissionRow, type Diagnostic, type Evidence, type Event, type Sample, type Unit } from "./observedLagrangianPhaseP.js";

// Ordinary infrastructure must never load observed data or construct Simulation.
// Even a present stage cannot cause science in the infrastructure describe block.
const scientificScope = vi.hoisted(() => ({ active: false }));
vi.mock("../app/exploreEnvironmentRepresentations.js", async original => {
  if (scientificScope.active) return original();
  throw new Error("TRIPWIRE: observed Analysis loading outside scientific entry");
});
vi.mock("../app/goshenObservedEnvironment.js", async original => {
  if (scientificScope.active) return original();
  throw new Error("TRIPWIRE: observed Source loading outside scientific entry");
});
vi.mock("../simulation/Simulation.js", async original => {
  if (scientificScope.active) return original();
  throw new Error("TRIPWIRE: Simulation outside scientific entry");
});
const selected = selectPhasePStage(process.env);

/** Hand-authored arrays only. No integrator, observed profile or collector. */
function toy(h = 0.5, memberId = "C0", xOffset = 0): Evidence {
  const samples: Sample[] = Array.from({ length: 1 / h + 1 }, (_, index) => ({ index, tick: index * h * 16, time: index * h,
    position: { x: index * h + xOffset * index * h, y: 500, z: 0 }, age: index * h, active: true,
    source: "FULL_SUPPORT", analysis: "FULL_SUPPORT", primary: true, clipped: false }));
  const id = `toy/${memberId}/${h}`;
  const trajectory: Unit = { id, caseId: "toy", memberId, seedId: "s", resolutionId: `h${h}`, h, C: [0, 0], fingerprints: {},
    samples, steps: samples.slice(1).map((s, i) => ({ fromIndex: i, dt: h, operands: [], total: { x: 1, y: 0, z: 0 }, proposed: s.position, accepted: s.position, events: [] })), events: [], termination: "MAX_TIME" };
  const d = (representation: "Source" | "Analysis"): Diagnostic[] => samples.map(s => ({ index: s.index, representation,
    status: "FULL_SUPPORT", segment: 0, bracket: [0, 1000], omega: [1, 0], gradient: [1, 0], T1: 1e-4,
    provenance: "hand-authored" }));
  return { trajectory, diagnostics: { id, Source: d("Source"), Analysis: d("Analysis") } };
}
function event(a = 0, b = 0.5, kind: Event["kind"] = "segment-change"): Event {
  return { kind, representation: "Analysis", boundary: 1000, direction: 1, fromSegment: 0, toSegment: 1, a, b };
}
function rows(overrides: Partial<AdmissionRow> = {}): AdmissionRow[] {
  return S.candidates.map(c => ({ ...c, complete: true, viable: true, numerical: true, controls: true, unresolved: false, reasons: [], ...overrides }));
}

describe("Phase P infrastructure (no observed scientific collection)", () => {
  it("guards presence, exact value and conflicts without mutating env", () => {
    expect(selectPhasePStage(Object.freeze({}))).toBe("SKIPPED");
    expect(selectPhasePStage({ OBSERVED_C_MATRIX_STAGE: "E1" })).toBe("SKIPPED");
    expect(selectPhasePStage(Object.freeze({ [S.stageVariable]: "PHASE_P" }))).toBe("ELIGIBLE");
    for (const value of [undefined, "", " ", "PHASE_P ", "all", "*", "phase_p", "E1"]) expect(() => selectPhasePStage({ [S.stageVariable]: value })).toThrow();
    for (const key of ["OBSERVED_C_MATRIX_STAGE", "STORM_MOTION_VALIDATION_STAGE"]) for (const value of [undefined, "", "E1"])
      expect(() => selectPhasePStage({ [S.stageVariable]: "PHASE_P", [key]: value })).toThrow("Conflicting");
  });
  it("has one immutable inherited C/storm source and pinned digest", () => {
    expect(PHASE_P_INHERITED.storm).toBe(FROZEN_E1_STORM_ONLY);
    PHASE_P_CASES.forEach((c, i) => expect(c.members).toBe(E1_SPEC.cases[i].members));
    expect(Object.isFrozen(S.seeds[0])).toBe(true);
    expect(Object.isFrozen(PHASE_P_CASES)).toBe(true);
    expect(checkPhasePSpecIntegrity().every(c => c.satisfied)).toBe(true);
    expect(bytesHash(readFileSync(S.document))).toBe(S.documentSha256);
  });
  it("transcribes exact seeds, ladders, policies and budgets", () => {
    expect(S.seeds.map(s => [s.id, s.x, s.y, s.z])).toEqual([
      ["S1-L",3200,2000,2400],["S2-L",-2400,2000,3200],["S3-L",-3200,2000,-2400],["S4-L",2400,2000,-3200],
      ["S1-H",3200,3000,2400],["S2-H",-2400,3000,3200],["S3-H",-3200,3000,-2400],["S4-H",2400,3000,-3200],
    ]);
    expect(S.durations).toEqual([180,360,540]); expect(S.Tmin).toBe(180);
    expect(S.resolutions.map(r => [r.dt,r.ticks])).toEqual([[0.5,8],[0.25,4],[0.125,2],[0.0625,1]]);
    expect(S.candidates.map(c => [c.T,c.h])).toEqual([[540,0.5],[540,0.25],[360,0.5],[360,0.25],[180,0.5],[180,0.25]]);
    expect(S.budget).toEqual({ position:10, vertical:3, response:10, verticalResponse:3,
      historyAbsolute:1e-6, historyRelative:0.01, pointAbsolute:5e-6, pointRelative:0.02,
      exposureAbsolute:1e-5, exposureRelative:0.01, exposureFloor:1e-3,
      eventAbsoluteSeconds:1, eventStepFactor:2, crossingExpansionSteps:2, nonWorseningFraction:0.1,
      oracleAbsoluteMetres:1e-9, oracleUlpFactor:128, epsilon:2**-52 });
    expect(S.stride).toBe(1); expect(S.maxRefinement).toBe(3); expect(S.policies.materialThresholds).toBe("STILL_OPEN");
  });
  it("absent stage returns before preflight, I/O or any observed import", async () => {
    expect(await collectPhaseP({ env: {}, reviewedImplementationSha: undefined, root: "DOES_NOT_EXIST", outputDirectory: "DOES_NOT_EXIST" })).toMatchObject({ state:"SKIPPED", unitsCollected:0 });
  });
  it("unreviewed SHA cannot obtain construction capability", () => {
    const p = staticPreflight({ env:{ [S.stageVariable]:"PHASE_P" }, reviewedImplementationSha:undefined, root:process.cwd(), outputDirectory:"unused" });
    expect(p.context).toBeNull(); expect(p.fault).toContain("REVIEWED_IMPLEMENTATION_SHA_REQUIRED");
  });
  it("matches dyadic clocks and indexes; rejects missing/drifting evidence", () => {
    expect(assertClock(1080,8,540)).toBe(8640);
    expect(() => assertClock(1,8,0.5000000001)).toThrow("CLOCK");
    const c=toy(), f=toy(0.25);
    expect(matchCommonSamples(c.trajectory,f.trajectory,1).map(p=>p.map(s=>s.index))).toEqual([[0,0],[1,2],[2,4]]);
    expect(matchCommonSamples(c.trajectory,{ ...f.trajectory,samples:f.trajectory.samples.slice(0,3) },1)).toHaveLength(2);
    expect(() => matchCommonSamples(c.trajectory,{ ...f.trajectory,samples:f.trajectory.samples.filter(s=>s.index!==2) },1)).toThrow("MISSING");
  });
  it("uses upper segment ownership, closed Source ends, and no case branches", () => {
    const t=buildSupportTopology([0,10,20],["FULL_SUPPORT","FULL_SUPPORT","BOUNDARY_CONDITIONED"]);
    expect([segmentAt(t,0),segmentAt(t,10),segmentAt(t,20)]).toEqual([0,1,1]);
    expect(supportAt(t,10)).toBe("BOUNDARY_CONDITIONED");
    expect(supportAt(t,-1)).toBe("OUT_OF_DOMAIN"); expect(supportAt(null,5)).toBe("COLUMN_UNAVAILABLE");
    expect(()=>buildSupportTopology([0,0])).toThrow();
  });
  it("detects upward/downward touches and stationary support exactly", () => {
    const t=buildSupportTopology([0,10,20],["FULL_SUPPORT","FULL_SUPPORT","BOUNDARY_CONDITIONED"]);
    expect(inspectAcceptedSegment(t,5,10,0,0.5,"Analysis")).toMatchObject({eligible:false,events:[{boundary:10,direction:1}]});
    expect(inspectAcceptedSegment(t,10,5,0,0.5,"Analysis")).toMatchObject({eligible:false,events:[{boundary:10,direction:-1}]});
    expect(inspectAcceptedSegment(t,15,10,0,0.5,"Analysis").events).toEqual([]);
    expect(inspectAcceptedSegment(t,10,10,0,0.5,"Analysis").eligible).toBe(false);
    expect(inspectAcceptedSegment(buildSupportTopology([0,10,20]),0,20,0,0.5,"Source").eligible).toBe(true);
  });
  it("detects interior unsupported interval even with supported endpoints", () => {
    const t=buildSupportTopology([0,10,20,30,40],["FULL_SUPPORT","FULL_SUPPORT","BOUNDARY_CONDITIONED","FULL_SUPPORT","FULL_SUPPORT"]);
    expect(supportAt(t,5)).toBe("FULL_SUPPORT"); expect(supportAt(t,35)).toBe("FULL_SUPPORT");
    const r=inspectAcceptedSegment(t,5,35,0,0.5,"Analysis");
    expect(r.eligible).toBe(false); expect(r.events.map(e=>e.boundary)).toEqual([10,20,30]);
  });
  it("primary prefix never reopens and excludes clipping/Source exit", () => {
    expect(primaryAfterStep(true,true,true,true,true)).toBe(false);
    expect(primaryAfterStep(true,false,true,true,false)).toBe(false);
    expect(primaryAfterStep(false,true,true,true,false)).toBe(false);
    expect(primaryAfterStep(true,true,false,false,false)).toBe(true);
    const u=toy().trajectory, samples=u.samples.map((s,i)=>({...s,primary:i!==1}));
    expect(prefixTime({...u,samples},1)).toBe(0);
    expect(commonTime([u,{...u,samples}],1,0.5)).toBe(0);
  });
  it("uses exact position/vertical and response budgets", () => {
    const c=toy(),f=toy(0.25);
    expect(comparePositions(c.trajectory,f.trajectory,1).every(c=>c.satisfied)).toBe(true);
    const changed={...f.trajectory,samples:f.trajectory.samples.map(s=>({...s,position:{...s.position,y:504}}))};
    expect(comparePositions(c.trajectory,changed,1).map(c=>c.satisfied)).toEqual([true,false]);
    expect(comparePathResponse(toy(0.5,"m",4).trajectory,toy(0.25,"m",4).trajectory,c.trajectory,f.trajectory,1).every(c=>c.satisfied)).toBe(true);
  });
  it("integrates signed and unsigned exposure independently, with own fine scale", () => {
    expect(integrateExposure([0,0.5,1],[2,-2,2])).toEqual({abs:2,signed:0});
    expect(compareExposure(0,0,"signed")).toMatchObject({tolerance:1e-5,referenceScale:1e-3,satisfied:true});
    expect(compareExposure(2.02,2,"abs").tolerance).toBe(0.02);
    expect(compareExposure(0.00002,0,"signed").satisfied).toBe(false);
    expect(()=>integrateExposure([0,0],[1,2])).toThrow();
  });
  it("computes history and pointwise budgets from fine values without scale substitution", () => {
    const c=toy(),f=toy(0.25);
    const modified={...c,diagnostics:{...c.diagnostics,Source:c.diagnostics.Source.map(d=>({...d,T1:0.000102}))}};
    const r=compareT1(modified,f,1,"Source");
    expect(r.checks.find(c=>c.id==="Source/history")!.tolerance).toBeCloseTo(2e-6,16);
    expect(r.checks.find(c=>c.id.startsWith("Source/point/"))!.tolerance).toBeCloseTo(7e-6,16);
    expect(r.applicable).toBe(3);
  });
  it("uses every fine-grid sample for exposure and keeps common-grid history", () => {
    const c=toy(),f=toy(0.25);
    const fine={...f,diagnostics:{...f.diagnostics,Source:f.diagnostics.Source.map((d,i)=>({...d,T1:i%2 ? -0.01 : 0.0001}))}};
    const r=compareT1(c,fine,1,"Source").checks;
    expect(r.find(c=>c.id==="Source/history")!.residual).toBe(0);
    expect(r.find(c=>c.id==="Source/exposure/abs")!.referenceScale).toBeCloseTo(0.00505,15);
    expect(r.find(c=>c.id==="Source/exposure/signed")!.referenceScale).toBeCloseTo(0.00495,15);
  });
  it("uses one common three-resolution interval across all five members", () => {
    const units=E1_SPEC.memberIds.flatMap(m=>S.resolutions.map(r=>toy(r.dt,m)));
    const i=units.findIndex(e=>e.trajectory.memberId==="right_minus"&&e.trajectory.h===0.125);
    units[i]={...units[i],trajectory:{...units[i].trajectory,samples:units[i].trajectory.samples.filter(s=>s.time<=0.5)}};
    const result=evaluateSeed(units,1,0.5);
    expect(result.viable).toBe(false);
    expect(result.exclusions.every(e=>e.end===0.5)).toBe(true);
    expect(result.checks.filter(c=>c.id==="prefix-time/Kstar")).toHaveLength(2);
  });
  it("expands the whole bracket only for pointwise checks", () => {
    expect(excludedByCrossing(-1,0.5,[event()],"Analysis")).toBe(true);
    expect(excludedByCrossing(1.5,0.5,[event()],"Analysis")).toBe(true);
    expect(excludedByCrossing(1.5001,0.5,[event()],"Analysis")).toBe(false);
    const c=toy(),f=toy(0.25), changed={...c,trajectory:{...c.trajectory,events:[event()]}};
    const r=compareT1(changed,f,1,"Analysis");
    expect(r.checks.find(c=>c.id==="Analysis/point")).toMatchObject({status:"N_A",reason:"NO_SEGMENT_MATCHED_SAMPLES"});
    expect(r.checks.filter(c=>c.id.includes("history")||c.id.includes("exposure"))).toHaveLength(3);
  });
  it("keeps Moore-style Analysis typed N_A without numeric fallback", () => {
    const unavailable=(e:Evidence):Evidence=>({...e,diagnostics:{...e.diagnostics,Analysis:e.diagnostics.Analysis.map(d=>({...d,status:"COLUMN_UNAVAILABLE",T1:null,omega:null,gradient:null,bracket:null,segment:null}))}});
    expect(compareT1(unavailable(toy()),unavailable(toy(0.25)),1,"Analysis").checks[0]).toMatchObject({status:"N_A",reason:"COLUMN_UNAVAILABLE"});
  });
  it("ignores all events after a candidate prefix, including pointwise exclusions", () => {
    const c=toy(), f=toy(0.25);
    const later={...c,trajectory:{...c.trajectory,events:[event(1,1.5),event(1,1.5,"ground")]}};
    expect(compareT1(later,f,1,"Analysis")).toEqual(compareT1(c,f,1,"Analysis"));
    expect(compareEvents(later.trajectory,f.trajectory,1)).toEqual(compareEvents(c.trajectory,f.trajectory,1));
  });
  it("uses finer-pair budget for non-worsening and keeps ordinary failures", () => {
    const coarse=[numericCheck("Source/history",2,3,"s^-2")], fine=[numericCheck("Source/history",2.3,2.5,"s^-2")];
    expect(compareSuccessiveRefinements(coarse,fine)[0]).toMatchObject({tolerance:0.25,satisfied:false});
    expect(compareSuccessiveRefinements(coarse,[numericCheck("Source/history",2.2,2.5,"s^-2")])[0].satisfied).toBe(true);
  });
  it("compares lifecycle brackets and types without demanding matching ordinary crossings", () => {
    const c={...toy().trajectory,events:[event(0,0.5,"ground")]},f={...toy(0.25).trajectory,events:[event(0.25,0.5,"ground")]};
    expect(compareEvents(c,f,1).every(c=>c.satisfied)).toBe(true);
    expect(compareEvents(c,{...f,events:[event(0.25,0.5,"source-exit")]},1).some(c=>!c.satisfied)).toBe(true);
  });
  it("rejects a fine event bracket wider than its own timestep but within the coarse timestep", () => {
    const c={...toy().trajectory,events:[event(0,0.5,"ground")]};
    const f={...toy(0.25).trajectory,events:[event(0.125,0.5,"ground")]};
    const checks=compareEvents(c,f,1);
    expect(checks.find(c=>c.id==="event-width/c/0")).toMatchObject({residual:0.5,tolerance:0.5,satisfied:true});
    expect(checks.find(c=>c.id==="event-width/f/0")).toMatchObject({residual:0.375,tolerance:0.25,satisfied:false,status:"INVALID CONTROL"});
    expect(checks.find(c=>c.id==="event-time/0/ground")).toMatchObject({residual:0.125,tolerance:1,satisfied:true});
    expect(checks.filter(c=>!c.satisfied).map(c=>c.id)).toEqual(["event-width/f/0"]);
  });
  it("first-step oracle is independent arithmetic with exact signs and applicability", () => {
    const b=toy().trajectory, m0=toy(0.5,"m").trajectory;
    const m={...m0,C:[2,3] as const,samples:m0.samples.map((s,i)=>i===1?{...s,position:{x:b.samples[1].position.x-1,y:500,z:1.5}}:s)};
    const v=Array.from({length:5},()=>({x:1,y:0,z:0}));
    expect(checkFirstStepOracle(m,b,v)).toMatchObject({satisfied:true,tolerance:1e-9});
    expect(checkFirstStepOracle({...m,C:[-2,3]},b,v).status).toBe("UNEXPLAINED");
    expect(checkFirstStepOracle({...m,samples:m.samples.map((s,i)=>({...s,clipped:i===1}))},b,v).status).toBe("INVALID CONTROL");
  });
  it("selects longest duration then coarsest dt, rejects incomplete/unresolved and no partial pattern", () => {
    expect(selectQualifiedCandidate(rows()).selected).toEqual({T:540,h:0.5});
    const r=rows(); r[0]={...r[0],numerical:false};
    expect(selectQualifiedCandidate(r).selected).toEqual({T:540,h:0.25});
    expect(selectQualifiedCandidate(rows({viable:false}))).toMatchObject({state:"QUALIFICATION_COMPLETE",selected:null,control:"INVALID CONTROL"});
    expect(selectQualifiedCandidate(rows({unresolved:true})).state).toBe("QUALIFICATION_INCOMPLETE");
    const late=rows();late[5]={...late[5],unresolved:true};
    expect(selectQualifiedCandidate(late).selected).toBeNull();
    expect(selectQualifiedCandidate([]).selected).toBeNull();
  });
  it("serializes deterministically and rejects nonfinite/untyped absence", () => {
    expect(serializeCanonicalRecord({b:2,a:[null,1]})).toBe('{"a":[null,1],"b":2}');
    expect(digest({a:1,b:2})).toBe(digest({b:2,a:1}));
    for(const x of [NaN,Infinity,undefined])expect(()=>serializeCanonicalRecord({x})).toThrow();
    expect(()=>serializeCanonicalRecord(Array(2))).toThrow("SPARSE");
  });
  it("uses exclusive synthetic artifacts and preserves partial files without overwrite", () => {
    const parent=mkdtempSync(join(tmpdir(),"phase-p-infrastructure-")), dir=join(parent,"toy");
    const a=new QualificationArtifacts(dir), p=a.append("trajectory.ndjson",{fixture:"hand-authored",x:1});
    expect(a.read("trajectory.ndjson",p)).toEqual({fixture:"hand-authored",x:1});
    expect(a.hash("trajectory.ndjson")).toHaveLength(64); a.close(false);
    expect(readdirSync(dir).every(n=>n.endsWith(".partial"))).toBe(true);
    expect(()=>new QualificationArtifacts(dir)).toThrow("COLLISION");
    const complete=join(parent,"complete"), b=new QualificationArtifacts(complete);b.append("summary.json",{fixture:true});b.close(true);
    expect(readdirSync(complete)).toContain("summary.json");
  });
  it("keeps a durable incomplete marker and never overwrites a final collision", () => {
    const parent=mkdtempSync(join(tmpdir(),"phase-p-infrastructure-")), dir=join(parent,"collision");
    const a=new QualificationArtifacts(dir);
    a.execution({state:"QUALIFICATION_INCOMPLETE",fixture:true});
    expect(JSON.parse(readFileSync(join(dir,"execution.json.partial"),"utf8")).state).toBe("QUALIFICATION_INCOMPLETE");
    a.execution({state:"QUALIFICATION_INCOMPLETE",fixture:true,count:1});
    expect(JSON.parse(readFileSync(join(dir,"execution.json.partial"),"utf8")).count).toBe(1);
    writeFileSync(join(dir,"manifest.json"),"external",{flag:"wx"});
    expect(()=>a.close(true)).toThrow(); a.close(false);
    expect(readFileSync(join(dir,"manifest.json"),"utf8")).toBe("external");
    expect(readdirSync(dir).filter(n=>n.endsWith(".partial"))).toHaveLength(7);
  });
  it("conforms synthetic ordered composition without Simulation or observed construction", async () => {
    const {CompositeVelocityField}=await import("../core/fields/CompositeVelocityField.js");
    const values=[{x:1e16,y:2,z:3},{x:-1e16,y:4,z:5},{x:1,y:6,z:7}];
    const fields=values.map(value=>({sample:()=>value}));
    expect(new CompositeVelocityField(fields).sample({x:0,y:0,z:0},0)).toEqual(orderedSum(values));
    const {applyAtmosphericTracerDomain}=await import("../simulation/AtmosphericTracerDomain.js");
    expect(applyAtmosphericTracerDomain({x:0,y:1,z:0},{x:2,y:-1,z:0})).toEqual({position:{x:1,y:0,z:0},active:false});
  });
  it("statically forbids scenario/UI/E1 collector dependency and bounds scientific entry", () => {
    const text=readFileSync("src/validation/observedLagrangianPhaseP.ts","utf8");
    expect(text).not.toMatch(/(?:from\s*|import\s*\()\s*["'][^"']*(?:DEMO_SCENARIO|composeDemo|ScenarioConfig|\/ui\/|observedCMatrixE1\.js)["']/);
    const spec=readFileSync("src/validation/observedLagrangianPhasePSpec.ts","utf8");
    expect(spec).not.toMatch(/from ["'](?:node:|\.\.\/)/);
  });
});

it.skipIf(selected !== "ELIGIBLE")("Phase P scientific collection (separate execution authorization required)", async () => {
  scientificScope.active=true;
  try {
  const result=await collectPhaseP({env:process.env,root:process.cwd(),
    reviewedImplementationSha:process.env.OBSERVED_LAGRANGIAN_PHASE_P_REVIEWED_SHA,
    outputDirectory:process.env.OBSERVED_LAGRANGIAN_PHASE_P_OUTPUT ?? ""});
  // Evidence is finalized before the runner assertion. No automatic scientific FAIL.
  process.stdout.write(serializeCanonicalRecord(result)+"\n");
  expect(result.state).toBe("QUALIFICATION_COMPLETE");
  } finally { scientificScope.active=false; }
}, 86_400_000);
