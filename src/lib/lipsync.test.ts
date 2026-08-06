import assert from "node:assert/strict";
import { test } from "node:test";

import { visemeAt, type MouthCue } from "./lipsync";

// Shaped like a real Rhubarb transcript: time-ordered, with a rest gap.
const cues: MouthCue[] = [
  { start: 0.0, end: 0.4, value: "A" }, // -> viseme_PP
  { start: 0.4, end: 0.9, value: "D" }, // -> viseme_AA
  { start: 1.5, end: 2.0, value: "F" }, // -> viseme_U
];

test("maps a cue covering the timestamp to its viseme", () => {
  assert.equal(visemeAt(cues, 0.2), "viseme_PP");
  assert.equal(visemeAt(cues, 0.6), "viseme_AA");
  assert.equal(visemeAt(cues, 1.7), "viseme_U");
});

test("returns null in the gap between cues", () => {
  // 0.9 -> 1.5 is silence; the caller relaxes all visemes toward zero here.
  assert.equal(visemeAt(cues, 1.2), null);
});

test("returns null outside the transcript on both sides", () => {
  assert.equal(visemeAt(cues, -1), null);
  assert.equal(visemeAt(cues, 99), null);
});

test("bounds are inclusive, and the earlier cue wins when they touch", () => {
  // 0.4 is the end of cue 0 and the start of cue 1. Iteration stops at the
  // first match, so the earlier cue takes it. Locking this in because a
  // switch to exclusive bounds would silently drop a frame at every
  // boundary — the kind of thing that reads as "lipsync feels off".
  assert.equal(visemeAt(cues, 0.4), "viseme_PP");
  assert.equal(visemeAt(cues, 0.0), "viseme_PP");
  assert.equal(visemeAt(cues, 0.9), "viseme_AA");
});

test("X (rest) maps to the closed mouth shape", () => {
  assert.equal(visemeAt([{ start: 0, end: 1, value: "X" }], 0.5), "viseme_PP");
});

test("tolerates a missing cue list", () => {
  assert.equal(visemeAt(undefined, 0.5), null);
  assert.equal(visemeAt([], 0.5), null);
});
