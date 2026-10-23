import test from "node:test";
import assert from "node:assert/strict";
import { initial, latest, progress, load } from "../src/data.ts";

test("demo relationships are coherent across the whole development pathway", () => {
  const playerIds = new Set(initial.players.map((p) => p.id));
  const planIds = new Set(initial.plans.map((p) => p.id));
  const clusterIds = new Set(initial.clusters.map((c) => c.id));
  for (const a of initial.assessments) {
    assert.ok(playerIds.has(a.playerId));
    for (const k of [
      "technical",
      "physical",
      "tactical",
      "psychological",
    ] as const)
      assert.ok(a[k] >= 0 && a[k] <= 100);
  }
  for (const p of initial.plans) {
    assert.ok(playerIds.has(p.playerId));
    assert.ok(p.target > p.baseline);
    if (p.approved)
      assert.ok(initial.assessments.some((a) => a.playerId === p.playerId));
  }
  for (const c of initial.clusters)
    for (const id of c.playerIds) assert.ok(playerIds.has(id));
  for (const i of initial.interventions) {
    assert.ok(planIds.has(i.planId));
    assert.ok(clusterIds.has(i.clusterId));
    const p = initial.plans.find((p) => p.id === i.planId)!;
    assert.ok(
      initial.clusters
        .find((c) => c.id === i.clusterId)
        ?.playerIds.includes(p.playerId),
    );
    assert.ok(p.approved);
  }
  for (const m of initial.measurements) assert.ok(planIds.has(m.planId));
});
test("progress uses the latest dated measurement and stays within 0 to 100", () => {
  const s = structuredClone(initial),
    p = s.plans[0];
  assert.equal(latest(s, p), 20);
  assert.equal(progress(s, p), 67);
  s.measurements.push({
    id: "old",
    planId: p.id,
    value: 13,
    date: "2026-09-20",
    notes: "",
  });
  assert.equal(latest(s, p), 20);
  s.measurements.push({
    id: "future",
    planId: p.id,
    value: 30,
    date: "2026-10-23",
    notes: "",
  });
  assert.equal(progress(s, p), 100);
  s.measurements.push({
    id: "same-day",
    planId: p.id,
    value: 1,
    date: "2026-10-23",
    notes: "",
  });
  assert.equal(progress(s, p), 0);
});
test("a new plan without measurements starts at its baseline", () => {
  const p = { ...initial.plans[0], id: "new-plan" };
  assert.equal(latest(initial, p), p.baseline);
  assert.equal(progress(initial, p), 0);
});
test("saved browser data loads and malformed JSON falls back to demo data", () => {
  let raw: string | null = null;
  Object.defineProperty(globalThis, "localStorage", {
    value: { getItem: () => raw },
    configurable: true,
  });
  assert.equal(load().players.length, 8);
  const s = structuredClone(initial);
  s.players.push({ ...s.players[0], id: "test", name: "Neil Desai" });
  raw = JSON.stringify(s);
  assert.equal(load().players.length, 9);
  raw = "{broken";
  assert.equal(load().players.length, 8);
  raw = "{}";
  assert.equal(load().plans.length, 5);
});
