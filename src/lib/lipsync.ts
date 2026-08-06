import { corresponding } from "@/constants/corresponding";

export type MouthCue = {
  start: number;
  end: number;
  value: keyof typeof corresponding;
};

/**
 * Resolves the morph target that should be active at a given point in the
 * audio timeline.
 *
 * Cues come from a Rhubarb-style transcript: a flat, time-ordered list of
 * `{ start, end, value }` spans where `value` is a Preston Blair mouth shape
 * (A-H, plus X for rest). `corresponding` maps those letters onto the
 * ARKit-style viseme blendshapes the Ready Player Me mesh actually exposes.
 *
 * Returns null when no cue covers the timestamp — gaps between cues are
 * legitimate, and the caller relaxes every viseme toward zero in that case.
 *
 * Bounds are inclusive on both ends, matching the original inline loop: when
 * adjacent cues touch, the earlier one wins because iteration stops at the
 * first hit.
 */
export function visemeAt(
  mouthCues: MouthCue[] | undefined,
  time: number
): string | null {
  if (!mouthCues) return null;

  for (const cue of mouthCues) {
    if (time >= cue.start && time <= cue.end) {
      return corresponding[cue.value] ?? null;
    }
  }

  return null;
}
